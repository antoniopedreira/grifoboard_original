
import Header from "@/components/Header";
import MainPageContent from "@/components/MainPageContent";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <MainPageContent />
      </main>
    </div>
  );
};

export default Index;
