
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, Trash2, Crown, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TeamManagement = () => {
  const { user, currentBusinessPlan } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (currentBusinessPlan?.business_plan_id) {
      loadTeamMembers();
    }
  }, [currentBusinessPlan]);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          status,
          joined_at,
          user_profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('business_plan_id', currentBusinessPlan.business_plan_id)
        .eq('status', 'active');

      if (error) {
        console.error('Error loading team members:', error);
        return;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error in loadTeamMembers:', error);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !currentBusinessPlan?.business_plan_id) return;

    setIsInviting(true);
    try {
      // Call edge function to send invitation
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: inviteEmail,
          businessPlanId: currentBusinessPlan.business_plan_id,
          invitedBy: user?.id
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${inviteEmail}`,
      });

      setInviteEmail('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erro ao enviar convite",
        description: "Não foi possível enviar o convite. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const isAdmin = currentBusinessPlan?.role === 'admin' || currentBusinessPlan?.role === 'owner';

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      default:
        return <User className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'owner':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <CardTitle>Equipe do Projeto</CardTitle>
          </div>
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Convidar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Convidar Membro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email do convidado</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        className="pl-10"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleInvite} 
                    disabled={!inviteEmail || isInviting}
                    className="w-full"
                  >
                    {isInviting ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamMembers.map((member: any) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={member.user_profiles?.avatar_url} />
                  <AvatarFallback>
                    {member.user_profiles?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">
                    {member.user_profiles?.full_name || 'Usuário'}
                  </p>
                  <p className="text-sm text-slate-500">
                    Membro desde {new Date(member.joined_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={`${getRoleBadgeColor(member.role)} flex items-center space-x-1`}>
                  {getRoleIcon(member.role)}
                  <span className="capitalize">{member.role}</span>
                </Badge>
                {isAdmin && member.user_profiles?.id !== user?.id && (
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {teamMembers.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro encontrado</p>
              <p className="text-sm">Convide pessoas para colaborar no projeto</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamManagement;
