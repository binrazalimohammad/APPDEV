import React, { useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../app/reducers';
import { clearError } from '../app/reducers/error';
import { COLORS, RADIUS, SPACING } from '../utils';

type ErrorDisplayProps = {
  visible?: boolean;
  onDismiss?: () => void;
};

const ErrorDisplay = ({ visible, onDismiss }: ErrorDisplayProps) => {
  const dispatch = useDispatch();
  const error = useSelector((s: RootState) => s.error);

  useEffect(() => {
    if (error?.statusCode === 0) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [dispatch, error?.statusCode, onDismiss]);

  const handleDismiss = () => {
    dispatch(clearError());
    onDismiss?.();
  };

  if (!error?.message) {
    return null;
  }

  const statusCode = error.statusCode ?? undefined;
  const title =
    statusCode === 401
      ? 'Session expired'
      : statusCode === 403
        ? 'Access denied'
        : statusCode === 422
          ? 'Validation error'
          : statusCode === 0
            ? 'Network error'
            : 'Error';

  return (
    <Modal
      visible={visible !== false && !!error.message}
      transparent
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.scroll}>
            <Text style={styles.message}>{error.message}</Text>
            {Object.keys(error.fieldErrors).length > 0 ? (
              <View style={styles.fields}>
                {Object.entries(error.fieldErrors).map(([field, msg]) => (
                  <Text key={field} style={styles.fieldLine}>
                    {field}: {String(msg)}
                  </Text>
                ))}
              </View>
            ) : null}
          </ScrollView>
          <TouchableOpacity style={styles.dismiss} onPress={handleDismiss}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
    padding: SPACING.lg,
    maxHeight: '75%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.brown,
    marginBottom: SPACING.sm,
  },
  scroll: { maxHeight: 220, marginBottom: SPACING.md },
  message: { fontSize: 14, lineHeight: 20, color: COLORS.text },
  fields: { marginTop: SPACING.sm },
  fieldLine: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  dismiss: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  dismissText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default ErrorDisplay;
