import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Button, TextInput, Alert, StyleSheet } from "react-native";
import { getRoles, createRole } from "../constants/roles";
import { useRouter } from "expo-router";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const router = useRouter();

  const loadRoles = async () => {
    try {
      const res = await getRoles();
      setRoles(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fetch roles";
      Alert.alert("Error", msg);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name) return Alert.alert("Error", "Role name is required");
    try {
      await createRole({ ...newRole, request_approval: true, permissions: [] });
      Alert.alert("Success", "Role created successfully");
      setNewRole({ name: "", description: "" });
      loadRoles();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to create role");
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roles Management</Text>

      <TextInput
        placeholder="Role Name"
        style={styles.input}
        value={newRole.name}
        onChangeText={(v) => setNewRole({ ...newRole, name: v })}
      />
      <TextInput
        placeholder="Description"
        style={styles.input}
        value={newRole.description}
        onChangeText={(v) => setNewRole({ ...newRole, description: v })}
      />
      <Button title="Create Role" onPress={handleCreateRole} />

      <Text style={{ fontSize: 18, marginVertical: 10 }}>All Roles:</Text>
      <FlatList
        data={roles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.roleItem}>
            <Text style={styles.roleName}>{item.name}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />

      <Button title="Back to Home" onPress={() => router.push("/home")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginVertical: 5 },
  roleItem: { padding: 10, marginVertical: 5, borderWidth: 1, borderRadius: 6 },
  roleName: { fontWeight: "bold", fontSize: 16 },
});
