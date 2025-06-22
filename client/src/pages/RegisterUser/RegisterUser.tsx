import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { registerSchema } from "../../schemas/register";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Form } from "../../components/ui/form";
import { Label } from "@radix-ui/react-label";
import { Button } from "../../components/ui/button";
import useAuth from "../../hooks/useAuth";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

const RegisterUser = () => {
  const { createUser, loading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  async function onSubmit(data: z.infer<typeof registerSchema>) {
    try {
      await createUser(data.name, data.email, data.password);
      showSuccessToast("User registered successfully!");
      reset();
      navigate(from, { replace: true });
    } catch (error: any) {
      showErrorToast(error.message || "Registration failed");
    }
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Username</Label>
                  <Input
                    id="name"
                    placeholder="johndoe"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="******"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Register"}
                </Button>
              </div>
            </form>
          </Form>
          <div className="text-center mt-4">
            <p className="text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterUser;