// pages/Settings.tsx
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Bell, 
  Lock, 
  Shield, 
  User, 
  Mail, 
  Smartphone,
  Globe,
  Moon,
  Sun,
  Save,
  Key,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  CreditCard,
  Database,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  eventReminders: boolean;
  messageAlerts: boolean;
  weeklyDigest: boolean;
  soundNotifications: boolean;
  desktopNotifications: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  deviceManagement: boolean;
  ipWhitelist: string[];
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  sidebarCollapsed: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'clubs_only';
  showEmail: boolean;
  showPhone: boolean;
  showActivity: boolean;
  allowMessagesFrom: 'everyone' | 'clubs_only' | 'none';
}

interface DataSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  exportData: boolean;
  deleteAccount: boolean;
}

export default function Settings() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    messageAlerts: true,
    weeklyDigest: false,
    soundNotifications: true,
    desktopNotifications: true
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true,
    deviceManagement: true,
    ipWhitelist: []
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'light',
    compactMode: false,
    fontSize: 'medium',
    animations: true,
    sidebarCollapsed: false
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    showActivity: true,
    allowMessagesFrom: 'everyone'
  });

  const [dataSettings, setDataSettings] = useState<DataSettings>({
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    exportData: false,
    deleteAccount: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");

  const handleSaveNotifications = () => {
    toast.success("Préférences de notifications enregistrées");
  };

  const handleSaveSecurity = () => {
    toast.success("Paramètres de sécurité enregistrés");
  };

  const handleSaveAppearance = () => {
    toast.success("Préférences d'affichage enregistrées");
    // Appliquer le thème
    if (appearanceSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (appearanceSettings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // Système
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleSavePrivacy = () => {
    toast.success("Paramètres de confidentialité enregistrés");
  };

  const handleSaveData = () => {
    toast.success("Paramètres de données enregistrés");
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword) {
      toast.error("Veuillez entrer votre mot de passe actuel");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    toast.success("Mot de passe changé avec succès");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleExportData = () => {
    toast.info("Préparation de l'export de vos données...");
    setTimeout(() => {
      toast.success("Données exportées avec succès");
    }, 1500);
  };

  const handleDeleteAccount = () => {
    if (confirmDeleteText !== "SUPPRIMER") {
      toast.error("Veuillez taper SUPPRIMER pour confirmer");
      return;
    }
    setIsDeleting(true);
    setTimeout(() => {
      toast.error("Compte supprimé avec succès");
      setIsDeleting(false);
      // Rediriger vers la page de login
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }, 2000);
  };

  const SettingSwitch = ({ 
    label, 
    description, 
    checked, 
    onChange,
    disabled = false
  }: { 
    label: string; 
    description?: string; 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <p className="font-medium text-gray-700">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onChange} 
        disabled={disabled}
      />
    </div>
  );

  const SettingSelect = ({
    label,
    value,
    options,
    onChange,
    description
  }: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    description?: string;
  }) => (
    <div className="py-3">
      <label className="block font-medium text-gray-700 mb-2">{label}</label>
      {description && <p className="text-sm text-gray-500 mb-2">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8] bg-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav userName="Admin User" userRole="Administrateur" notificationCount={5} />

        <main className="flex-1 overflow-y-auto bg-[#F7F8FC] p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1B2A4A] mb-2">Paramètres</h1>
              <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
            </div>

            <Tabs defaultValue="notifications" className="space-y-4">
              <TabsList className="bg-white">
                <TabsTrigger value="notifications">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Lock className="w-4 h-4 mr-2" />
                  Sécurité
                </TabsTrigger>
                <TabsTrigger value="appearance">
                  <Globe className="w-4 h-4 mr-2" />
                  Apparence
                </TabsTrigger>
                <TabsTrigger value="privacy">
                  <Shield className="w-4 h-4 mr-2" />
                  Confidentialité
                </TabsTrigger>
                <TabsTrigger value="password">
                  <Key className="w-4 h-4 mr-2" />
                  Mot de passe
                </TabsTrigger>
                <TabsTrigger value="data">
                  <Database className="w-4 h-4 mr-2" />
                  Données
                </TabsTrigger>
              </TabsList>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Préférences de notifications</h2>
                  <div className="space-y-2 divide-y divide-gray-100">
                    <SettingSwitch
                      label="Notifications par email"
                      description="Recevoir des notifications par email"
                      checked={notificationSettings.emailNotifications}
                      onChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                    />
                    <SettingSwitch
                      label="Notifications push"
                      description="Recevoir des notifications push sur le navigateur"
                      checked={notificationSettings.pushNotifications}
                      onChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                    />
                    <SettingSwitch
                      label="Notifications desktop"
                      description="Notifications de bureau"
                      checked={notificationSettings.desktopNotifications}
                      onChange={(checked) => setNotificationSettings({ ...notificationSettings, desktopNotifications: checked })}
                    />
                    <SettingSwitch
                      label="Sons de notification"
                      description="Jouer un son lors des notifications"
                      checked={notificationSettings.soundNotifications}
                      onChange={(checked) => setNotificationSettings({ ...notificationSettings, soundNotifications: checked })}
                    />
                    <SettingSwitch
                      label="Notifications par SMS"
                      description="Recevoir des alertes par SMS"
                      checked={notificationSettings.smsNotifications}
                      onChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotifications: checked })}
                    />
                    <SettingSwitch
                      label="Rappels d'événements"
                      description="Recevoir des rappels avant les événements"
                      checked={notificationSettings.eventReminders}
                      onChange={(checked) => setNotificationSettings({ ...notificationSettings, eventReminders: checked })}
                    />
                    <SettingSwitch
                      label="Alertes de messages"
                      description="Être notifié des nouveaux messages"
                      checked={notificationSettings.messageAlerts}
                      onChange={(checked) => setNotificationSettings({ ...notificationSettings, messageAlerts: checked })}
                    />
                    <SettingSwitch
                      label="Résumé hebdomadaire"
                      description="Recevoir un résumé des activités chaque semaine"
                      checked={notificationSettings.weeklyDigest}
                      onChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyDigest: checked })}
                    />
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveNotifications} className="bg-[#0EA8A8]">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Paramètres de sécurité</h2>
                  <div className="space-y-2 divide-y divide-gray-100">
                    <SettingSwitch
                      label="Authentification à deux facteurs"
                      description="Ajouter une couche de sécurité supplémentaire avec une application d'authentification"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                    />
                    <SettingSwitch
                      label="Alertes de connexion"
                      description="Recevoir une alerte lors d'une nouvelle connexion"
                      checked={securitySettings.loginAlerts}
                      onChange={(checked) => setSecuritySettings({ ...securitySettings, loginAlerts: checked })}
                    />
                    <SettingSwitch
                      label="Gestion des appareils"
                      description="Voir et gérer les appareils connectés"
                      checked={securitySettings.deviceManagement}
                      onChange={(checked) => setSecuritySettings({ ...securitySettings, deviceManagement: checked })}
                    />
                    <div className="py-3">
                      <label className="block font-medium text-gray-700 mb-2">
                        Délai d'inactivité (minutes)
                      </label>
                      <p className="text-sm text-gray-500 mb-2">
                        Déconnexion automatique après une période d'inactivité
                      </p>
                      <select
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8] bg-white"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 heure</option>
                        <option value={120}>2 heures</option>
                        <option value={240}>4 heures</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveSecurity} className="bg-[#0EA8A8]">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Préférences d'affichage</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium text-gray-700 mb-2">Thème</label>
                      <p className="text-sm text-gray-500 mb-2">Choisissez l'apparence de l'application</p>
                      <div className="flex gap-3">
                        <Button
                          variant={appearanceSettings.theme === 'light' ? 'default' : 'outline'}
                          onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'light' })}
                          className={appearanceSettings.theme === 'light' ? 'bg-[#0EA8A8]' : ''}
                        >
                          <Sun className="w-4 h-4 mr-2" />
                          Clair
                        </Button>
                        <Button
                          variant={appearanceSettings.theme === 'dark' ? 'default' : 'outline'}
                          onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'dark' })}
                          className={appearanceSettings.theme === 'dark' ? 'bg-[#0EA8A8]' : ''}
                        >
                          <Moon className="w-4 h-4 mr-2" />
                          Sombre
                        </Button>
                        <Button
                          variant={appearanceSettings.theme === 'system' ? 'default' : 'outline'}
                          onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: 'system' })}
                          className={appearanceSettings.theme === 'system' ? 'bg-[#0EA8A8]' : ''}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Système
                        </Button>
                      </div>
                    </div>
                    
                    <SettingSwitch
                      label="Mode compact"
                      description="Afficher plus d'informations dans moins d'espace"
                      checked={appearanceSettings.compactMode}
                      onChange={(checked) => setAppearanceSettings({ ...appearanceSettings, compactMode: checked })}
                    />
                    
                    <SettingSwitch
                      label="Animations"
                      description="Activer les animations et transitions"
                      checked={appearanceSettings.animations}
                      onChange={(checked) => setAppearanceSettings({ ...appearanceSettings, animations: checked })}
                    />
                    
                    <div>
                      <label className="block font-medium text-gray-700 mb-2">Taille du texte</label>
                      <select
                        value={appearanceSettings.fontSize}
                        onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8] bg-white"
                      >
                        <option value="small">Petit</option>
                        <option value="medium">Moyen</option>
                        <option value="large">Grand</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveAppearance} className="bg-[#0EA8A8]">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Confidentialité</h2>
                  <div className="space-y-2 divide-y divide-gray-100">
                    <div className="py-3">
                      <label className="block font-medium text-gray-700 mb-2">Visibilité du profil</label>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8] bg-white"
                      >
                        <option value="public">Public - Tout le monde peut voir</option>
                        <option value="clubs_only">Membres des clubs uniquement</option>
                        <option value="private">Privé - Uniquement moi</option>
                      </select>
                    </div>
                    
                    <SettingSwitch
                      label="Afficher mon email"
                      description="Visible par les autres membres"
                      checked={privacySettings.showEmail}
                      onChange={(checked) => setPrivacySettings({ ...privacySettings, showEmail: checked })}
                    />
                    
                    <SettingSwitch
                      label="Afficher mon téléphone"
                      description="Visible par les autres membres"
                      checked={privacySettings.showPhone}
                      onChange={(checked) => setPrivacySettings({ ...privacySettings, showPhone: checked })}
                    />
                    
                    <SettingSwitch
                      label="Afficher mon activité"
                      description="Voir mes interactions sur la plateforme"
                      checked={privacySettings.showActivity}
                      onChange={(checked) => setPrivacySettings({ ...privacySettings, showActivity: checked })}
                    />
                    
                    <div className="py-3">
                      <label className="block font-medium text-gray-700 mb-2">Qui peut m'envoyer des messages ?</label>
                      <select
                        value={privacySettings.allowMessagesFrom}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, allowMessagesFrom: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0EA8A8] bg-white"
                      >
                        <option value="everyone">Tout le monde</option>
                        <option value="clubs_only">Membres de mes clubs uniquement</option>
                        <option value="none">Personne</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSavePrivacy} className="bg-[#0EA8A8]">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Changer le mot de passe</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          placeholder="Entrez votre mot de passe actuel"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nouveau mot de passe
                      </label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Entrez votre nouveau mot de passe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmer le mot de passe
                      </label>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirmez votre nouveau mot de passe"
                      />
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Le mot de passe doit contenir au moins 6 caractères
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleChangePassword} className="bg-[#0EA8A8]">
                      <Key className="w-4 h-4 mr-2" />
                      Changer le mot de passe
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Data Tab */}
              <TabsContent value="data">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Données et préférences</h2>
                  <div className="space-y-4">
                    <SettingSelect
                      label="Langue"
                      value={dataSettings.language}
                      options={[
                        { value: "fr", label: "Français" },
                        { value: "en", label: "English" },
                        { value: "es", label: "Español" },
                        { value: "de", label: "Deutsch" }
                      ]}
                      onChange={(value) => setDataSettings({ ...dataSettings, language: value })}
                    />
                    
                    <SettingSelect
                      label="Fuseau horaire"
                      value={dataSettings.timezone}
                      options={[
                        { value: "Europe/Paris", label: "Europe/Paris (GMT+1)" },
                        { value: "Europe/London", label: "Europe/London (GMT+0)" },
                        { value: "America/New_York", label: "America/New_York (GMT-5)" },
                        { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" }
                      ]}
                      onChange={(value) => setDataSettings({ ...dataSettings, timezone: value })}
                    />
                    
                    <SettingSelect
                      label="Format de date"
                      value={dataSettings.dateFormat}
                      options={[
                        { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
                        { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
                        { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" }
                      ]}
                      onChange={(value) => setDataSettings({ ...dataSettings, dateFormat: value })}
                    />
                    
                    <div className="border-t border-gray-200 my-4"></div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-[#1B2A4A]">Gestion des données</h3>
                      
                      <Button
                        onClick={handleExportData}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exporter mes données
                      </Button>
                      
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-700">Supprimer le compte</h4>
                            <p className="text-sm text-red-600 mt-1">
                              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                            </p>
                            <div className="mt-3 space-y-3">
                              <Input
                                placeholder='Tapez "SUPPRIMER" pour confirmer'
                                value={confirmDeleteText}
                                onChange={(e) => setConfirmDeleteText(e.target.value)}
                                className="border-red-300 focus:border-red-500 focus:ring-red-500"
                              />
                              <Button
                                onClick={handleDeleteAccount}
                                variant="destructive"
                                disabled={isDeleting || confirmDeleteText !== "SUPPRIMER"}
                                className="w-full"
                              >
                                {isDeleting ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Suppression en cours...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer mon compte
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveData} className="bg-[#0EA8A8]">
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
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