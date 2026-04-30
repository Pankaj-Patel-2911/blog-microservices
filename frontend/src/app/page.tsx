"use client";

import { useAppData } from "@/context/AppContext";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { loading } = useAppData();

  if (loading) return <Loading />;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Button>Click me</Button>
    </div>
  );
};

export default Home;