import React, {useMemo, useState} from 'react';
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
  Image,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {ProfilePhotoAsset} from '../../domain/entities/User';
import {theme} from '../theme/theme';

interface RegisterScreenProps {
  onRegister: (
    email: string,
    password: string,
    name: string,
    bio: string,
    gender: 'male' | 'female',
    lookingFor: Array<'male' | 'female'>,
    citySlug: string,
    profilePhoto: ProfilePhotoAsset,
  ) => Promise<void>;
  onNavigateToLogin: () => void;
}

interface CityOption {
  id: string;
  name: string;
  slug: string;
  country: string;
}

const CITY_OPTIONS: CityOption[] = [
  {id: 'fr-toulouse', name: 'Toulouse', slug: 'toulouse', country: 'FR'},
  {id: 'fr-paris', name: 'Paris', slug: 'paris', country: 'FR'},
  {id: 'fr-lyon', name: 'Lyon', slug: 'lyon', country: 'FR'},
  {id: 'fr-marseille', name: 'Marseille', slug: 'marseille', country: 'FR'},
  {id: 'fr-bordeaux', name: 'Bordeaux', slug: 'bordeaux', country: 'FR'},
  {id: 'fr-lille', name: 'Lille', slug: 'lille', country: 'FR'},
];

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onNavigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [lookingFor, setLookingFor] = useState<Array<'male' | 'female'>>([]);
  const [citySlug, setCitySlug] = useState<string | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [showCityOptions, setShowCityOptions] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<ProfilePhotoAsset | null>(
    null,
  );
  const [photoError, setPhotoError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canSubmit = !loading && !!profilePhoto;
  const selectedCity = CITY_OPTIONS.find(city => city.slug === citySlug);
  const filteredCities = useMemo(() => {
    const query = citySearch.trim().toLowerCase();
    if (!query) {
      return CITY_OPTIONS;
    }
    return CITY_OPTIONS.filter(city => city.name.toLowerCase().includes(query));
  }, [citySearch]);

  const handlePickPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      setError('Impossible de sélectionner la photo. Réessayez.');
      return;
    }

    const asset = result.assets?.[0];
    if (asset) {
      setProfilePhoto(asset);
      setPhotoError('');
      setError('');
      return;
    }

    setPhotoError('Veuillez sélectionner une photo de profil.');
    setError("Aucune photo n'a été sélectionnée.");
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoError('Veuillez sélectionner une photo de profil.');
    setError('');
  };

  const handleRegister = async () => {
    if (!email || !password || !name || !bio) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    if (!gender || lookingFor.length === 0) {
      setError('Veuillez sélectionner votre genre et vos préférences');
      return;
    }
    if (!citySlug) {
      setError('Veuillez sélectionner votre ville');
      return;
    }
    if (bio.length < 10) {
      setError('La description doit contenir au moins 10 caractères');
      return;
    }
    if (!profilePhoto) {
      setPhotoError('Veuillez ajouter une photo de profil.');
      setError('Veuillez ajouter une photo de profil.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setPhotoError('');
      await onRegister(
        email,
        password,
        name,
        bio,
        gender,
        lookingFor,
        citySlug,
        profilePhoto,
      );
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

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Votre ville</Text>
              <TextInput
                style={styles.input}
                placeholder="Rechercher votre ville"
                placeholderTextColor={theme.colors.textLight}
                value={citySearch}
                onChangeText={value => {
                  setCitySearch(value);
                  setShowCityOptions(true);
                }}
                onFocus={() => setShowCityOptions(true)}
                editable={!loading}
              />
              {showCityOptions ? (
                <View style={styles.cityOptions}>
                  {filteredCities.length === 0 ? (
                    <Text style={styles.cityEmpty}>
                      Aucune ville ne correspond à la recherche
                    </Text>
                  ) : (
                    filteredCities.map(city => (
                      <TouchableOpacity
                        key={city.id}
                        style={[
                          styles.cityOption,
                          city.slug === citySlug && styles.cityOptionSelected,
                        ]}
                        onPress={() => {
                          setCitySlug(city.slug);
                          setCitySearch(city.name);
                          setShowCityOptions(false);
                          setError('');
                        }}
                        disabled={loading}>
                        <Text
                          style={[
                            styles.cityOptionText,
                            city.slug === citySlug &&
                              styles.cityOptionTextSelected,
                          ]}>
                          {city.name}
                        </Text>
                        <Text style={styles.cityOptionCountry}>
                          {city.country}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              ) : null}
              {selectedCity ? (
                <Text style={styles.citySelected}>
                  Ville sélectionnée : {selectedCity.name}
                </Text>
              ) : null}
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Votre genre</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    gender === 'male' && styles.optionButtonSelected,
                  ]}
                  onPress={() => setGender('male')}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.optionText,
                      gender === 'male' && styles.optionTextSelected,
                    ]}>
                    Homme
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    gender === 'female' && styles.optionButtonSelected,
                  ]}
                  onPress={() => setGender('female')}
                  disabled={loading}>
                  <Text
                    style={[
                      styles.optionText,
                      gender === 'female' && styles.optionTextSelected,
                    ]}>
                    Femme
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionGroup}>
              <Text style={styles.optionLabel}>Vous souhaitez voir</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    lookingFor.includes('male') && styles.optionButtonSelected,
                  ]}
                  onPress={() =>
                    setLookingFor(current =>
                      current.includes('male')
                        ? current.filter(value => value !== 'male')
                        : [...current, 'male'],
                    )
                  }
                  disabled={loading}>
                  <Text
                    style={[
                      styles.optionText,
                      lookingFor.includes('male') && styles.optionTextSelected,
                    ]}>
                    Hommes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    lookingFor.includes('female') &&
                      styles.optionButtonSelected,
                  ]}
                  onPress={() =>
                    setLookingFor(current =>
                      current.includes('female')
                        ? current.filter(value => value !== 'female')
                        : [...current, 'female'],
                    )
                  }
                  disabled={loading}>
                  <Text
                    style={[
                      styles.optionText,
                      lookingFor.includes('female') &&
                        styles.optionTextSelected,
                    ]}>
                    Femmes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.photoSection}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handlePickPhoto}
                disabled={loading}>
                <Text style={styles.photoButtonText}>
                  {profilePhoto
                    ? 'Changer la photo de profil'
                    : 'Ajouter une photo de profil'}
                </Text>
              </TouchableOpacity>
              {photoError ? (
                <Text style={styles.photoError}>{photoError}</Text>
              ) : null}
              {profilePhoto?.uri ? (
                <>
                  <Image
                    source={{uri: profilePhoto.uri}}
                    style={styles.photoPreview}
                    accessibilityLabel="Aperçu de la photo de profil sélectionnée"
                  />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={handleRemovePhoto}
                    disabled={loading}>
                    <Text style={styles.removePhotoText}>Retirer la photo</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.button, !canSubmit && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={!canSubmit}>
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
  optionGroup: {
    gap: theme.spacing.sm,
  },
  optionLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  optionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  cityOptions: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    maxHeight: 200,
    overflow: 'hidden',
  },
  cityOption: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cityOptionSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  cityOptionText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
  },
  cityOptionTextSelected: {
    color: theme.colors.text,
  },
  cityOptionCountry: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  citySelected: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  cityEmpty: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
  },
  optionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.sm,
  },
  optionTextSelected: {
    color: theme.colors.surface,
    fontWeight: '600',
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
  photoSection: {
    gap: theme.spacing.sm,
  },
  photoButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
  },
  photoButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
  },
  photoHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  photoError: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: theme.borderRadius.md,
  },
  removePhotoButton: {
    alignItems: 'center',
  },
  removePhotoText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
  },
});
