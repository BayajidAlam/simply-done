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
}

interface Inventory {
  all: {
    vars: {
      alb_dns: string;
      mongodb_ip: string;
      key_file: string;
      bastion_host: string;
      ansible_ssh_common_args: string;
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
          ansible_ssh_common_args: `-o StrictHostKeyChecking=no -o ProxyCommand="ssh -W %h:%p -q ubuntu@${outputs.bastionPublicIp} -i ${keyPath}"`
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
          },
        },
      },
    };

    const inventoryDir = path.resolve(__dirname, "../ansible/inventory");
    fs.mkdirSync(inventoryDir, { recursive: true });

    fs.writeFileSync(
      path.join(inventoryDir, "hosts.yml"),
      yaml.dump(inventory, { noRefs: true, quotingType: '"' })
    );

    console.log("Updated Ansible inventory - Backend managed by ASG");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}