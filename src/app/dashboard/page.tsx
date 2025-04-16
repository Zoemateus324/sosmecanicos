

export default function Dashboard() {
  const { userType } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Bem-vindo, {userType}</h2>
    
    
    </div>
  );
}