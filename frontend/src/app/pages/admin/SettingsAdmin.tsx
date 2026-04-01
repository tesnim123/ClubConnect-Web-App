// pages/admin/Settings.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  Bell, Lock, Shield, User, Mail, Globe, Moon, Sun, Save, Key, 
  Eye, EyeOff, Database, Trash2, Download, AlertTriangle, RefreshCw,
  Users, Settings, Clock, FileText, Calendar, BarChart, Activity,
  AlertCircle, Server, Wifi, ShieldAlert, UserCog, Ban, CheckCircle,
  MailCheck, Smartphone, Monitor, Building, CreditCard, FileCheck,
  Volume2
} from "lucide-react";
import { toast } from "sonner";

// Données admin mock
const currentAdmin = {
  id: "admin_1",
  firstName: "Admin",
  lastName: "User",
  email: "admin@university.edu",
  avatar: "",
  role: "admin",
  roleLabel: "Administrateur",
  phone: "+216 12 345 678",
  department: "Direction des affaires étudiantes",
  joinDate: "2020-01-15"
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(currentAdmin);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      desktop: true,
      sound: true,
      eventRequests: true,
      resourceBookings: true,
      systemAlerts: true,
      weeklyReports: true,
      criticalIssues: true
    },
    appearance: {
      theme: 'light' as 'light' | 'dark' | 'system',
      compactMode: false,
      fontSize: 'medium' as 'small' | 'medium' | 'large',
      animations: true,
      dashboardLayout: 'grid' as 'grid' | 'list' | 'compact'
    },
    privacy: {
      profileVisibility: 'public' as 'public' | 'staff_only' | 'private',
      showEmail: true,
      showPhone: false,
      showDepartment: true,
      allowMessagesFrom: 'everyone' as 'everyone' | 'staff_only' | 'none'
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 15,
      loginAlerts: true,
      ipWhitelist: false,
      allowedIPs: "",
      passwordExpiry: 90,
      loginAttempts: 5
    },
    administration: {
      autoApproveEvents: false,
      requireBudgetApproval: true,
      maxEventDuration: 24,
      advanceBookingDays: 90,
      maxParticipantsPerEvent: 500,
      resourceCheckRequired: true,
      sendApprovalEmails: true,
      notifyClubPresidents: true
    },
    system: {
      maintenanceMode: false,
      backupFrequency: 'daily' as 'daily' | 'weekly' | 'monthly',
      logRetention: 90,
      autoCleanup: true,
      debugMode: false,
      apiAccess: false
    }
  });

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (storedAdmin) {
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch (e) {}
    }
  }, []);

  const handleSaveNotifications = () => {
    toast.success("Préférences de notifications enregistrées");
  };

  const handleSaveAppearance = () => {
    if (settings.appearance.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.appearance.theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
    toast.success("Préférences d'affichage enregistrées");
  };

  const handleSavePrivacy = () => {
    toast.success("Paramètres de confidentialité enregistrés");
  };

  const handleSaveSecurity = () => {
    toast.success("Paramètres de sécurité enregistrés");
  };

  const handleSaveAdministration = () => {
    toast.success("Paramètres d'administration enregistrés");
  };

  const handleSaveSystem = () => {
    if (settings.system.maintenanceMode) {
      toast.warning("Mode maintenance activé - Le site sera inaccessible aux utilisateurs");
    }
    toast.success("Paramètres système enregistrés");
  };

  const handleChangePassword = () => {
    if (!passwordForm.current) {
      toast.error("Veuillez entrer votre mot de passe actuel");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    toast.success("Mot de passe changé avec succès");
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  const handleExportData = () => {
    toast.info("Préparation de l'export des données...");
    setTimeout(() => {
      toast.success("Export des données démarré. Vous recevrez un email avec le lien de téléchargement");
    }, 1500);
  };

  const handleDeleteAccount = () => {
    if (confirmDelete !== "SUPPRIMER_ADMIN") {
      toast.error("Veuillez taper SUPPRIMER_ADMIN pour confirmer");
      return;
    }
    setIsDeleting(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      toast.error("Compte administrateur supprimé");
      navigate("/login");
    }, 2000);
  };

  const handleClearCache = () => {
    toast.info("Nettoyage du cache...");
    setTimeout(() => {
      toast.success("Cache vidé avec succès");
    }, 1000);
  };

  const handleTestNotifications = () => {
    toast.info("Test de notification envoyé");
    setTimeout(() => {
      toast.success("Notification de test reçue");
    }, 500);
  };

  const SettingSwitch = ({ label, description, checked, onChange, disabled = false, icon: Icon = null }: any) => (
    <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <div>
          <p className="font-medium text-gray-700">{label}</p>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId={admin.id}
          userName={`${admin.firstName} ${admin.lastName}`}
          userRole={admin.roleLabel}
          userRoleType="admin"
          notificationCount={5}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0EA8A8] transition-colors mb-6"
            >
              ← Retour au tableau de bord
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2"> Paramètres administrateur</h1>
              <p className="text-gray-600">Gérez les paramètres système, vos préférences et la configuration de la plateforme</p>
            </div>

            <Tabs defaultValue="notifications" className="space-y-4">
              <TabsList className="bg-white flex-wrap h-auto p-2">
                <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
                <TabsTrigger value="appearance"><Globe className="w-4 h-4 mr-2" />Apparence</TabsTrigger>
                
                <TabsTrigger value="administration"><Settings className="w-4 h-4 mr-2" />Administration</TabsTrigger>
                <TabsTrigger value="system"><Server className="w-4 h-4 mr-2" />Système</TabsTrigger>
                <TabsTrigger value="password"><Key className="w-4 h-4 mr-2" />Mot de passe</TabsTrigger>
                <TabsTrigger value="data"><Database className="w-4 h-4 mr-2" />Données</TabsTrigger>
              </TabsList>

              {/* Notifications */}
              <TabsContent value="notifications">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4"> Préférences de notifications</h2>
                  <div className="space-y-2 divide-y divide-gray-100">
                    <SettingSwitch icon={Mail} label="Notifications par email" checked={settings.notifications.email} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, email: v}})} />
                    <SettingSwitch icon={Smartphone} label="Notifications push" checked={settings.notifications.push} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, push: v}})} />
                    <SettingSwitch icon={Monitor} label="Notifications desktop" checked={settings.notifications.desktop} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, desktop: v}})} />
                    <SettingSwitch icon={Volume2} label="Sons de notification" checked={settings.notifications.sound} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, sound: v}})} />
                    <SettingSwitch icon={FileCheck} label="Nouvelles demandes d'événements" checked={settings.notifications.eventRequests} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, eventRequests: v}})} />
                    <SettingSwitch icon={Calendar} label="Réservations de ressources" checked={settings.notifications.resourceBookings} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, resourceBookings: v}})} />
                    <SettingSwitch icon={AlertCircle} label="Alertes système critiques" checked={settings.notifications.criticalIssues} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, criticalIssues: v}})} />
                    <SettingSwitch icon={BarChart} label="Rapports hebdomadaires" description="Récapitulatif des activités de la semaine" checked={settings.notifications.weeklyReports} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, weeklyReports: v}})} />
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={handleTestNotifications}>
                      <Bell className="w-4 h-4 mr-2" />Tester les notifications
                    </Button>
                    <Button onClick={handleSaveNotifications} className="bg-[#0EA8A8]">
                      <Save className="w-4 h-4 mr-2" />Enregistrer
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Apparence */}
              <TabsContent value="appearance">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4"> Préférences d'affichage</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Thème</Label>
                      <div className="flex gap-3">
                        <Button variant={settings.appearance.theme === 'light' ? 'default' : 'outline'} onClick={() => setSettings({...settings, appearance: {...settings.appearance, theme: 'light'}})} className={settings.appearance.theme === 'light' ? 'bg-[#0EA8A8]' : ''}><Sun className="w-4 h-4 mr-2" />Clair</Button>
                        <Button variant={settings.appearance.theme === 'dark' ? 'default' : 'outline'} onClick={() => setSettings({...settings, appearance: {...settings.appearance, theme: 'dark'}})} className={settings.appearance.theme === 'dark' ? 'bg-[#0EA8A8]' : ''}><Moon className="w-4 h-4 mr-2" />Sombre</Button>
                        <Button variant={settings.appearance.theme === 'system' ? 'default' : 'outline'} onClick={() => setSettings({...settings, appearance: {...settings.appearance, theme: 'system'}})} className={settings.appearance.theme === 'system' ? 'bg-[#0EA8A8]' : ''}><Globe className="w-4 h-4 mr-2" />Système</Button>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Disposition du tableau de bord</Label>
                      <div className="flex gap-3">
                        <Button variant={settings.appearance.dashboardLayout === 'grid' ? 'default' : 'outline'} onClick={() => setSettings({...settings, appearance: {...settings.appearance, dashboardLayout: 'grid'}})} className={settings.appearance.dashboardLayout === 'grid' ? 'bg-[#0EA8A8]' : ''}>Grille</Button>
                        <Button variant={settings.appearance.dashboardLayout === 'list' ? 'default' : 'outline'} onClick={() => setSettings({...settings, appearance: {...settings.appearance, dashboardLayout: 'list'}})} className={settings.appearance.dashboardLayout === 'list' ? 'bg-[#0EA8A8]' : ''}>Liste</Button>
                        <Button variant={settings.appearance.dashboardLayout === 'compact' ? 'default' : 'outline'} onClick={() => setSettings({...settings, appearance: {...settings.appearance, dashboardLayout: 'compact'}})} className={settings.appearance.dashboardLayout === 'compact' ? 'bg-[#0EA8A8]' : ''}>Compact</Button>
                      </div>
                    </div>
                    <SettingSwitch label="Mode compact" description="Afficher plus d'informations dans moins d'espace" checked={settings.appearance.compactMode} onChange={(v: boolean) => setSettings({...settings, appearance: {...settings.appearance, compactMode: v}})} />
                    <SettingSwitch label="Animations" description="Activer les animations et transitions" checked={settings.appearance.animations} onChange={(v: boolean) => setSettings({...settings, appearance: {...settings.appearance, animations: v}})} />
                    <div>
                      <Label className="mb-2 block">Taille du texte</Label>
                      <select value={settings.appearance.fontSize} onChange={(e) => setSettings({...settings, appearance: {...settings.appearance, fontSize: e.target.value as any}})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0EA8A8] bg-white">
                        <option value="small">Petit</option>
                        <option value="medium">Moyen</option>
                        <option value="large">Grand</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveAppearance} className="bg-[#0EA8A8]"><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Confidentialité */}
           

              {/* Sécurité */}
              

              {/* Administration */}
              <TabsContent value="administration">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4"> Paramètres d'administration</h2>
                  <div className="space-y-4">
                    <SettingSwitch label="Auto-approbation des événements" description="Approuver automatiquement les événements (désactivé par défaut)" checked={settings.administration.autoApproveEvents} onChange={(v: boolean) => setSettings({...settings, administration: {...settings.administration, autoApproveEvents: v}})} />
                    <SettingSwitch label="Vérification des ressources requise" description="Vérifier la disponibilité avant approbation" checked={settings.administration.resourceCheckRequired} onChange={(v: boolean) => setSettings({...settings, administration: {...settings.administration, resourceCheckRequired: v}})} />
                    <SettingSwitch label="Approbation budgétaire requise" description="Nécessite une approbation du budget" checked={settings.administration.requireBudgetApproval} onChange={(v: boolean) => setSettings({...settings, administration: {...settings.administration, requireBudgetApproval: v}})} />
                    <SettingSwitch label="Envoyer des emails de confirmation" description="Notifier les clubs par email" checked={settings.administration.sendApprovalEmails} onChange={(v: boolean) => setSettings({...settings, administration: {...settings.administration, sendApprovalEmails: v}})} />
                    <SettingSwitch label="Notifier les présidents de club" description="Alerter les présidents des décisions" checked={settings.administration.notifyClubPresidents} onChange={(v: boolean) => setSettings({...settings, administration: {...settings.administration, notifyClubPresidents: v}})} />
                    <div>
                      <Label className="mb-2 block">Durée maximale d'événement (heures)</Label>
                      <Input type="number" value={settings.administration.maxEventDuration} onChange={(e) => setSettings({...settings, administration: {...settings.administration, maxEventDuration: parseInt(e.target.value)}})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="mb-2 block">Réservation à l'avance (jours)</Label>
                      <Input type="number" value={settings.administration.advanceBookingDays} onChange={(e) => setSettings({...settings, administration: {...settings.administration, advanceBookingDays: parseInt(e.target.value)}})} className="mt-1" />
                    </div>
                    <div>
                      <Label className="mb-2 block">Participants maximum par événement</Label>
                      <Input type="number" value={settings.administration.maxParticipantsPerEvent} onChange={(e) => setSettings({...settings, administration: {...settings.administration, maxParticipantsPerEvent: parseInt(e.target.value)}})} className="mt-1" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveAdministration} className="bg-[#0EA8A8]"><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Système */}
              <TabsContent value="system">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Paramètres système</h2>
                  <div className="space-y-4">
                    <SettingSwitch label="Mode maintenance" description="Rendre le site inaccessible aux utilisateurs (admin uniquement)" checked={settings.system.maintenanceMode} onChange={(v: boolean) => setSettings({...settings, system: {...settings.system, maintenanceMode: v}})} />
                    <SettingSwitch label="Nettoyage automatique" description="Supprimer automatiquement les anciennes données" checked={settings.system.autoCleanup} onChange={(v: boolean) => setSettings({...settings, system: {...settings.system, autoCleanup: v}})} />
                    <SettingSwitch label="Mode debug" description="Afficher les informations de débogage" checked={settings.system.debugMode} onChange={(v: boolean) => setSettings({...settings, system: {...settings.system, debugMode: v}})} />
                    <SettingSwitch label="Accès API" description="Activer l'API pour les développeurs externes" checked={settings.system.apiAccess} onChange={(v: boolean) => setSettings({...settings, system: {...settings.system, apiAccess: v}})} />
                    <div>
                      <Label className="mb-2 block">Fréquence des sauvegardes</Label>
                      <select value={settings.system.backupFrequency} onChange={(e) => setSettings({...settings, system: {...settings.system, backupFrequency: e.target.value as any}})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0EA8A8] bg-white">
                        <option value="daily">Quotidienne</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuelle</option>
                      </select>
                    </div>
                    <div>
                      <Label className="mb-2 block">Conservation des logs (jours)</Label>
                      <Input type="number" value={settings.system.logRetention} onChange={(e) => setSettings({...settings, system: {...settings.system, logRetention: parseInt(e.target.value)}})} className="mt-1" />
                    </div>
                    <div className="pt-4 border-t">
                      <Button variant="outline" onClick={handleClearCache} className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />Vider le cache
                      </Button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveSystem} className="bg-[#0EA8A8]"><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Mot de passe */}
              <TabsContent value="password">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4"> Changer le mot de passe</h2>
                  <div className="space-y-4">
                    <div>
                      <Label>Mot de passe actuel</Label>
                      <div className="relative mt-1">
                        <Input type={showPassword ? "text" : "password"} value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                          {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label>Nouveau mot de passe</Label>
                      <Input type={showPassword ? "text" : "password"} value={passwordForm.new} onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})} className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères, incluant lettres, chiffres et symboles</p>
                    </div>
                    <div>
                      <Label>Confirmer le mot de passe</Label>
                      <Input type={showPassword ? "text" : "password"} value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} className="mt-1" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleChangePassword} className="bg-[#0EA8A8]"><Key className="w-4 h-4 mr-2" />Changer le mot de passe</Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Données */}
              <TabsContent value="data">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">💾 Gestion des données</h2>
                  <div className="space-y-4">
                    <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />Exporter les données administrateur
                    </Button>
                    <Button onClick={handleExportData} variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />Exporter les logs système
                    </Button>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-700">⚠️ Supprimer le compte administrateur</h4>
                          <p className="text-sm text-red-600 mt-1">
                            Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                            Un autre administrateur devra confirmer cette action.
                          </p>
                          <div className="mt-3 space-y-3">
                            <Input 
                              placeholder='Tapez "SUPPRIMER_ADMIN" pour confirmer' 
                              value={confirmDelete} 
                              onChange={(e) => setConfirmDelete(e.target.value)} 
                              className="border-red-300"
                            />
                            <Button 
                              variant="destructive" 
                              disabled={isDeleting || confirmDelete !== "SUPPRIMER_ADMIN"} 
                              onClick={handleDeleteAccount} 
                              className="w-full"
                            >
                              {isDeleting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                              {isDeleting ? "Suppression en cours..." : "Supprimer mon compte administrateur"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Informations du compte */}
            <Card className="mt-6 p-6 bg-gradient-to-r from-[#0EA8A8]/10 to-transparent">
              <h3 className="font-semibold text-[#1B2A4A] mb-3"> Informations du compte administrateur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Nom complet:</span>
                  <span className="font-medium">{admin.firstName} {admin.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{admin.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Département:</span>
                  <span className="font-medium">{admin.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Membre depuis:</span>
                  <span className="font-medium">{new Date(admin.joinDate).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}