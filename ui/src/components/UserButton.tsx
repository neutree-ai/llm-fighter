import { Button } from "@/components/ui/button";
import { signIn, signOut, useWhoami } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const UserButton = () => {
  const { data, error, isLoading, authed } = useWhoami();

  const [startSignIn, setStartSignIn] = useState(false);

  if (!authed) {
    return (
      <Button
        onClick={() => {
          signIn("github");
          setStartSignIn(true);
        }}
        disabled={startSignIn}
      >
        {startSignIn ? <Loader2 className="animate-spin" /> : "Login"}
      </Button>
    );
  }

  if (isLoading) {
    return <Loader2 className="animate-spin text-foreground" />;
  }

  if (error) {
    console.error("Error fetching user data:", error);
    return <div className="text-red-200">Error loading user data</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer">
          <AvatarImage src={data?.user.avatarUrl} />
          <AvatarFallback>{data?.user.login.slice(0, 1)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="dark mr-4">
        <DropdownMenuLabel>{data?.user.login}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
