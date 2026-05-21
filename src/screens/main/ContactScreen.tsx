import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchContactContent } from '../../app/api/content';
import type { ContactContent } from '../../app/api/content';
import CustomButton from '../../components/CustomButton';
import { COLORS, FONT, SPACING } from '../../utils';

const ContactScreen = () => {
  const [content, setContent] = useState<ContactContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactContent()
      .then(setContent)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{content?.title}</Text>
      <Text style={styles.body}>{content?.description}</Text>
      <Text style={styles.body}>{content?.note}</Text>
      <CustomButton
        variant="primary"
        label={`Email ${content?.email ?? 'support'}`}
        onPress={() => {
          if (content?.email) {
            Linking.openURL(`mailto:${content.email}`);
          }
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...FONT.headline, color: COLORS.text, marginBottom: SPACING.sm },
  body: { ...FONT.body, color: COLORS.textSecondary, marginBottom: SPACING.md },
});

export default ContactScreen;
