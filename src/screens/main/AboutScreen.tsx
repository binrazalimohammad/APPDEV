import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchAboutContent } from '../../app/api/content';
import type { AboutContent } from '../../app/api/content';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils';

const AboutScreen = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent()
      .then(setContent)
      .catch(() => setContent(null))
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
      <Text style={styles.title}>{content?.title ?? 'About'}</Text>
      <Text style={styles.body}>{content?.description}</Text>
      <Text style={styles.section}>Our team</Text>
      {content?.team?.map(member => (
        <View key={member.name} style={styles.card}>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.role}>{member.position}</Text>
          <Text style={styles.bio}>{member.bio}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...FONT.headline, color: COLORS.text, marginBottom: SPACING.sm },
  body: { ...FONT.body, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  section: { ...FONT.bodyStrong, color: COLORS.text, marginBottom: SPACING.md },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  name: { ...FONT.bodyStrong, color: COLORS.text },
  role: { ...FONT.caption, color: COLORS.primary, marginVertical: 4 },
  bio: { ...FONT.body, color: COLORS.textSecondary },
});

export default AboutScreen;
