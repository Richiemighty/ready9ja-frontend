import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from "react-native";

export default function BecomeSeller() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    yearLaunched: "",
    category: "",
    nin: "",
    cac: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    // Simple validation
    if (!form.businessName || !form.category || !form.nin || !form.cac) {
      Alert.alert("Missing Info", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://ready9ja-api.onrender.com/api/sellers/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        Alert.alert("Success", "Your seller request has been submitted!");
        router.back();
      } else {
        Alert.alert("Error", "Unable to submit your request. Try again later.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Network request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Become a Seller</Text>
      <Text style={styles.subheader}>
        Fill out the form below to apply as a registered business seller.
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your business name"
          value={form.businessName}
          onChangeText={(v) => handleChange("businessName", v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Year Launched *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2019"
          value={form.yearLaunched}
          keyboardType="numeric"
          onChangeText={(v) => handleChange("yearLaunched", v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category of Business *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Fashion, Electronics"
          value={form.category}
          onChangeText={(v) => handleChange("category", v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>NIN *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your National ID Number"
          value={form.nin}
          onChangeText={(v) => handleChange("nin", v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>CAC Registration Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter CAC Number"
          value={form.cac}
          onChangeText={(v) => handleChange("cac", v)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Business Address</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Enter business address"
          multiline
          value={form.address}
          onChangeText={(v) => handleChange("address", v)}
        />
      </View>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Feather name="send" size={16} color="#fff" />
            <Text style={styles.submitText}>Submit Request</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 30,
    paddingTop: 100,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 6,
  },
  subheader: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
