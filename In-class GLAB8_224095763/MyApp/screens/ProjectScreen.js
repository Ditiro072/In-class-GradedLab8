import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { useProject } from '../contexts/ProjectContext';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);
  const { setSelectedProject } = useProject();
  const navigation = useNavigation();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), async (snapshot) => {
      const data = await Promise.all(snapshot.docs.map(async doc => {
        const tasksSnapshot = await getDocs(collection(db, 'projects', doc.id, 'tasks'));
        return {
          id: doc.id,
          ...doc.data(),
          taskCount: tasksSnapshot.size,
        };
      }));

      setProjects(data);
    });

    return () => unsub();
  }, []);

  const handlePress = (project) => {
    setSelectedProject(project);
    navigation.navigate('Tasks');
  };

  return (
    <FlatList
      data={projects}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} style={{ padding: 12, borderBottomWidth: 1 }}>
          <Text style={{ fontSize: 18 }}>{item.name}</Text>
          <Text>{item.taskCount} task(s)</Text>
        </TouchableOpacity>
      )}
    />
  );
}
