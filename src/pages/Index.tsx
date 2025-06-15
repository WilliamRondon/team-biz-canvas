
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CanvasEditor from "@/components/CanvasEditor";
import RealProgressDashboard from "@/components/RealProgressDashboard";
import DetailedSectionManager from "@/components/DetailedSectionManager";
import RealVotingCenter from "@/components/RealVotingCenter";
import TeamManagement from "@/components/TeamManagement";
import ProtectedRoute from "@/components/ProtectedRoute";

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Plano de Negócios Colaborativo
            </h1>
            <p className="text-gray-600">
              Desenvolva seu plano de negócios de forma colaborativa com sua equipe
            </p>
          </div>

          <Tabs defaultValue="canvas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="canvas">Business Model Canvas</TabsTrigger>
              <TabsTrigger value="voting">Centro de Votação</TabsTrigger>
              <TabsTrigger value="detailed">Plano Detalhado</TabsTrigger>
              <TabsTrigger value="progress">Dashboard de Progresso</TabsTrigger>
              <TabsTrigger value="team">Equipe</TabsTrigger>
            </TabsList>

            <TabsContent value="canvas" className="space-y-6">
              <CanvasEditor />
            </TabsContent>

            <TabsContent value="voting" className="space-y-6">
              <RealVotingCenter />
            </TabsContent>

            <TabsContent value="detailed" className="space-y-6">
              <Tabs defaultValue="conceito" className="space-y-4">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Plano de Negócios Detalhado</h2>
                  <p className="text-gray-600">
                    Desenvolva cada seção do seu plano de negócios com profundidade e colaboração.
                  </p>
                </div>
                
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="conceito">Conceito</TabsTrigger>
                  <TabsTrigger value="pesquisa">Pesquisa</TabsTrigger>
                  <TabsTrigger value="configuracao">Configuração</TabsTrigger>
                  <TabsTrigger value="projecoes">Projeções</TabsTrigger>
                </TabsList>

                <TabsContent value="conceito">
                  <DetailedSectionManager category="conceito" />
                </TabsContent>

                <TabsContent value="pesquisa">
                  <DetailedSectionManager category="pesquisa" />
                </TabsContent>

                <TabsContent value="configuracao">
                  <DetailedSectionManager category="configuracao" />
                </TabsContent>

                <TabsContent value="projecoes">
                  <DetailedSectionManager category="projecoes" />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <RealProgressDashboard />
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <TeamManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
