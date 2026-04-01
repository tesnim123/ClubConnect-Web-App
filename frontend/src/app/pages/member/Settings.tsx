// pages/member/Settings.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Sidebar } from "../../components/Sidebar";
import { TopNav } from "../../components/TopNav";
import { currentUser } from "../../data/mockData";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  Bell, Lock, Shield, User, Mail, Globe, Moon, Sun, Save, Key, 
  Eye, EyeOff, Volume2, VolumeX, Database, Trash2, Download, 
  AlertTriangle, RefreshCw, CheckCircle
} from "lucide-react";
import { toast } from "sonner";

export default function MemberSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser);
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
      eventReminders: true,
      messageAlerts: true,
      weeklyDigest: false
    },
    appearance: {
      theme: 'light' as 'light' | 'dark' | 'system',
      compactMode: false,
      fontSize: 'medium' as 'small' | 'medium' | 'large',
      animations: true
    },
    privacy: {
      profileVisibility: 'public' as 'public' | 'clubs_only' | 'private',
      showEmail: true,
      showPhone: false,
      showActivity: true,
      allowMessagesFrom: 'everyone' as 'everyone' | 'clubs_only' | 'none'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAlerts: true
    }
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
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

  const handleChangePassword = () => {
    if (!passwordForm.current) {
      toast.error("Veuillez entrer votre mot de passe actuel");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    toast.success("Mot de passe changé avec succès");
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  const handleExportData = () => {
    toast.info("Préparation de l'export...");
    setTimeout(() => toast.success("Données exportées avec succès"), 1500);
  };

  const handleDeleteAccount = () => {
    if (confirmDelete !== "SUPPRIMER") {
      toast.error("Veuillez taper SUPPRIMER pour confirmer");
      return;
    }
    setIsDeleting(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error("Compte supprimé");
      navigate("/login");
    }, 2000);
  };

  const SettingSwitch = ({ label, description, checked, onChange, disabled = false }: any) => (
    <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="font-medium text-gray-700">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar role="member" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          userId={user.id}
          userName={`${user.firstName} ${user.lastName}`}
          userAvatar={user.avatar}
          userRole={user.roleLabel}
          userRoleType="member"
          notificationCount={3}
        />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => navigate("/member/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0EA8A8] transition-colors mb-6"
            >
              ← Retour
            </button>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Paramètres</h1>
              <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
            </div>

            <Tabs defaultValue="notifications" className="space-y-4">
              <TabsList className="bg-white flex-wrap">
                <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
                <TabsTrigger value="appearance"><Globe className="w-4 h-4 mr-2" />Apparence</TabsTrigger>
                <TabsTrigger value="privacy"><Shield className="w-4 h-4 mr-2" />Confidentialité</TabsTrigger>
                <TabsTrigger value="security"><Lock className="w-4 h-4 mr-2" />Sécurité</TabsTrigger>
                <TabsTrigger value="password"><Key className="w-4 h-4 mr-2" />Mot de passe</TabsTrigger>
                <TabsTrigger value="data"><Database className="w-4 h-4 mr-2" />Données</TabsTrigger>
              </TabsList>

              <TabsContent value="notifications">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Préférences de notifications</h2>
                  <div className="space-y-2 divide-y divide-gray-100">
                    <SettingSwitch label="Notifications par email" checked={settings.notifications.email} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, email: v}})} />
                    <SettingSwitch label="Notifications push" checked={settings.notifications.push} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, push: v}})} />
                    <SettingSwitch label="Notifications desktop" checked={settings.notifications.desktop} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, desktop: v}})} />
                    <SettingSwitch label="Sons de notification" checked={settings.notifications.sound} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, sound: v}})} />
                    <SettingSwitch label="Rappels d'événements" checked={settings.notifications.eventReminders} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, eventReminders: v}})} />
                    <SettingSwitch label="Alertes de messages" checked={settings.notifications.messageAlerts} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, messageAlerts: v}})} />
                    <SettingSwitch label="Résumé hebdomadaire" description="Recevoir un résumé des activités chaque semaine" checked={settings.notifications.weeklyDigest} onChange={(v: boolean) => setSettings({...settings, notifications: {...settings.notifications, weeklyDigest: v}})} />
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveNotifications} className="bg-[#0EA8A8]"><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Préférences d'affichage</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Thème</Label>
                      <div className="flex gap-3">
                        <Button variant={settings.appearance.theme === 'light' ? 'default' : 'outline'} onClick={() => setSettings({...settings, appearance: {...settings.appearance, theme: 'light'}})} className={settings.appearance.theme === 'light' ? 'bg-[#0EA8A8]' : ''}><Sun className="w-4 h-4 mr-2" />Clair</Button>
                        <Button variant={settings.appearance.theme === 'dark' ? 'default' : 'outline'} onClick={() => setSettings({...settings, appearance: {...settings.appearance, theme: 'dark'}})} className={settings.appearance.theme === 'dark' ? 'bg-[#0EA8A8]' : ''}><Moon className="w-4 h-4 mr-2" />Sombre</Button>
                        <Button variant={settings.appearance.theme === 'system' ? 'default' : 'outline'} onClick={() => setSettings({...settings, appearance: {...settings.appearance, theme: 'system'}})} className={settings.appearance.theme === 'system' ? 'bg-[#0EA8A8]' : ''}><Globe className="w-4 h-4 mr-2" />Système</Button>
                      </div>
                    </div>
                    <SettingSwitch label="Mode compact" description="Afficher plus d'informations dans moins d'espace" checked={settings.appearance.compactMode} onChange={(v: boolean) => setSettings({...settings, appearance: {...settings.appearance, compactMode: v}})} />
                    <SettingSwitch label="Animations" description="Activer les animations et transitions" checked={settings.appearance.animations} onChange={(v: boolean) => setSettings({...settings, appearance: {...settings.appearance, animations: v}})} />
                    <div>
                      <Label className="mb-2 block">Taille du texte</Label>
                      <select value={settings.appearance.fontSize} onChange={(e) => setSettings({...settings, appearance: {...settings.appearance, fontSize: e.target.value as any}})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0EA8A8] bg-white">
                        <option value="small">Petit</option><option value="medium">Moyen</option><option value="large">Grand</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveAppearance} className="bg-[#0EA8A8]"><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="privacy">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Confidentialité</h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-2 block">Visibilité du profil</Label>
                      <select value={settings.privacy.profileVisibility} onChange={(e) => setSettings({...settings, privacy: {...settings.privacy, profileVisibility: e.target.value as any}})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0EA8A8] bg-white">
                        <option value="public">Public - Tout le monde peut voir</option>
                        <option value="clubs_only">Membres des clubs uniquement</option>
                        <option value="private">Privé - Uniquement moi</option>
                      </select>
                    </div>
                    <SettingSwitch label="Afficher mon email" checked={settings.privacy.showEmail} onChange={(v: boolean) => setSettings({...settings, privacy: {...settings.privacy, showEmail: v}})} />
                    <SettingSwitch label="Afficher mon téléphone" checked={settings.privacy.showPhone} onChange={(v: boolean) => setSettings({...settings, privacy: {...settings.privacy, showPhone: v}})} />
                    <SettingSwitch label="Afficher mon activité" checked={settings.privacy.showActivity} onChange={(v: boolean) => setSettings({...settings, privacy: {...settings.privacy, showActivity: v}})} />
                    <div>
                      <Label className="mb-2 block">Qui peut m'envoyer des messages ?</Label>
                      <select value={settings.privacy.allowMessagesFrom} onChange={(e) => setSettings({...settings, privacy: {...settings.privacy, allowMessagesFrom: e.target.value as any}})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0EA8A8] bg-white">
                        <option value="everyone">Tout le monde</option><option value="clubs_only">Membres de mes clubs uniquement</option><option value="none">Personne</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSavePrivacy} className="bg-[#0EA8A8]"><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Paramètres de sécurité</h2>
                  <div className="space-y-4">
                    <SettingSwitch label="Authentification à deux facteurs" description="Ajouter une couche de sécurité supplémentaire" checked={settings.security.twoFactorAuth} onChange={(v: boolean) => setSettings({...settings, security: {...settings.security, twoFactorAuth: v}})} />
                    <SettingSwitch label="Alertes de connexion" description="Recevoir une alerte lors d'une nouvelle connexion" checked={settings.security.loginAlerts} onChange={(v: boolean) => setSettings({...settings, security: {...settings.security, loginAlerts: v}})} />
                    <div>
                      <Label className="mb-2 block">Délai d'inactivité (minutes)</Label>
                      <select value={settings.security.sessionTimeout} onChange={(e) => setSettings({...settings, security: {...settings.security, sessionTimeout: parseInt(e.target.value)}})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0EA8A8] bg-white">
                        <option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 heure</option><option value={120}>2 heures</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveSecurity} className="bg-[#0EA8A8]"><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Changer le mot de passe</h2>
                  <div className="space-y-4">
                    <div>
                      <Label>Mot de passe actuel</Label>
                      <div className="relative mt-1">
                        <Input type={showPassword ? "text" : "password"} value={passwordForm.current} onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2"><EyeOff className="w-4 h-4 text-gray-400" /></button>
                      </div>
                    </div>
                    <div><Label>Nouveau mot de passe</Label><Input type={showPassword ? "text" : "password"} value={passwordForm.new} onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})} className="mt-1" /></div>
                    <div><Label>Confirmer le mot de passe</Label><Input type={showPassword ? "text" : "password"} value={passwordForm.confirm} onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} className="mt-1" /></div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleChangePassword} className="bg-[#0EA8A8]"><Key className="w-4 h-4 mr-2" />Changer le mot de passe</Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="data">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Données et préférences</h2>
                  <div className="space-y-4">
                    <Button onClick={handleExportData} variant="outline" className="w-full justify-start"><Download className="w-4 h-4 mr-2" />Exporter mes données</Button>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-700">Supprimer le compte</h4>
                          <p className="text-sm text-red-600 mt-1">Cette action est irréversible. Toutes vos données seront définitivement supprimées.</p>
                          <div className="mt-3 space-y-3">
                            <Input placeholder='Tapez "SUPPRIMER" pour confirmer' value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} className="border-red-300" />
                            <Button variant="destructive" disabled={isDeleting || confirmDelete !== "SUPPRIMER"} onClick={handleDeleteAccount} className="w-full">{isDeleting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}{isDeleting ? "Suppression..." : "Supprimer mon compte"}</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}