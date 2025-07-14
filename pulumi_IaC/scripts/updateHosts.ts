import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

export interface StackOutputs {
  albDnsName: string;
  frontendPublicIp: string;
  mongodbPrivateIp: string;
  bastionPublicIp: string;
}

interface InventoryHost {
  ansible_host: string;
  ansible_user: string;
  ansible_ssh_private_key_file: string;
  ansible_ssh_common_args?: string;
}

interface Inventory {
  all: {
    vars: {
      alb_dns: string;
      mongodb_ip: string;
      key_file: string;
      bastion_host: string;
    };
  };
  bastion: { hosts: { bastion1: InventoryHost } };
  frontend: { hosts: { frontend1: InventoryHost } };
  mongodb: { hosts: { mongo: InventoryHost } };
}

export function updateInventory(outputs: StackOutputs): void {
  const keyPath = path.resolve(__dirname, "../MyKeyPair.pem");
  
  try {
    const inventory: Inventory = {
      all: {
        vars: {
          alb_dns: outputs.albDnsName,
          mongodb_ip: outputs.mongodbPrivateIp,
          key_file: keyPath,
          bastion_host: outputs.bastionPublicIp,
        },
      },
      bastion: {
        hosts: {
          bastion1: {
            ansible_host: outputs.bastionPublicIp,
            ansible_user: "ubuntu",
            ansible_ssh_private_key_file: keyPath,
          },
        },
      },
      frontend: {
        hosts: {
          frontend1: {
            ansible_host: outputs.frontendPublicIp,
            ansible_user: "ubuntu",
            ansible_ssh_private_key_file: keyPath,
          },
        },
      },
      mongodb: {
        hosts: {
          mongo: {
            ansible_host: outputs.mongodbPrivateIp,
            ansible_user: "ubuntu",
            ansible_ssh_private_key_file: keyPath,
            ansible_ssh_common_args: `-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ProxyCommand="ssh -W %h:%p -o StrictHostKeyChecking=no -i ${keyPath} ubuntu@${outputs.bastionPublicIp}"`
          },
        },
      },
    };

    const inventoryDir = path.resolve(__dirname, "../ansible/inventory");
    fs.mkdirSync(inventoryDir, { recursive: true });

    fs.writeFileSync(
      path.join(inventoryDir, "hosts.yml"),
      yaml.dump(inventory, { 
        noRefs: true, 
        quotingType: '"',
        lineWidth: -1,  // Prevent line wrapping
        flowLevel: -1   // Keep block style
      })
    );

    console.log("✅ Updated Ansible inventory with SSH proxy for MongoDB");
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
}