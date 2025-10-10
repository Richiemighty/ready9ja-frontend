
'use client';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'; // ✅ add StyleSheet here
import { Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function IndexScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Welcome to Ready9ja 🚀
      </ThemedText>

      <Link href="/login" asChild>
        <TouchableOpacity>
          <ThemedText type="link">Login</ThemedText>
        </TouchableOpacity>
      </Link>

      <Link href="/register" asChild>
        <TouchableOpacity>
          <ThemedText type="link">Register</ThemedText>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  link: { color: 'blue', textAlign: 'center', marginTop: 10 },
});

