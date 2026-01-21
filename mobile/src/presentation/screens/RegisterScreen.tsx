import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {theme} from '../theme/theme';

interface RegisterScreenProps {
  onRegister: (
    email: string,
    password: string,
    name: string,
    bio: string,
  ) => Promise<void>;
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !name || !bio) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    if (bio.length < 10) {
      setError('La description doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onRegister(email, password, name, bio);
      // Success - the parent component will handle navigation
    } catch (err) {
      // Handle errors locally - never let them propagate
      console.warn('Registration error:', err);

      let errorMessage = "Échec de l'inscription. Veuillez réessayer.";

      if (err instanceof Error) {
        // Provide specific error messages based on error type
        if (err.message.includes('timeout')) {
          errorMessage =
            'La requête a expiré. Vérifiez votre connexion et réessayez.';
        } else if (
          err.message.includes('network') ||
          err.message.includes('Failed to fetch')
        ) {
          errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
        } else if (
          err.message.includes('already exists') ||
          err.message.includes('duplicate')
        ) {
          errorMessage =
            'Cet email est déjà utilisé. Utilisez-en un autre ou connectez-vous.';
        } else if (err.message.includes('invalid')) {
          errorMessage =
            "Données d'inscription invalides. Vérifiez vos informations.";
        }
        // Do not expose raw error messages from backend for security
      }

      setError(errorMessage);
      // Do NOT re-throw - keep the error local to prevent app crash
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Commencez votre parcours vers des connexions sincères
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Nom d'utilisateur"
              placeholderTextColor={theme.colors.textLight}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={theme.colors.textLight}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor={theme.colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Courte description (minimum 10 caractères)"
              placeholderTextColor={theme.colors.textLight}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={theme.colors.surface} />
              ) : (
                <Text style={styles.buttonText}>Créer un compte</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={onNavigateToLogin}
              disabled={loading}>
              <Text style={styles.linkText}>
                Vous avez déjà un compte ? Connectez-vous
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: '300',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
  },
  form: {
    gap: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  bioInput: {
    height: 100,
    paddingTop: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
});
