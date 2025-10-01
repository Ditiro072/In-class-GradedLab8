import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, Button, Alert } from 'react-native';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { useProject } from '../contexts/ProjectContext';

export default function TasksScreen() {
  const { selectedProject } = useProject();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    if (!selectedProject) return;

    const projectRef = doc(db, 'projects', selectedProject.id);

    const unsubProject = onSnapshot(projectRef, (docSnap) => {
      if (!docSnap.exists()) {
        Alert.alert('Project deleted', 'Returning to Projects screen.');
        navigation.navigate('Projects');
      }
    });

    const tasksRef = collection(db, 'projects', selectedProject.id, 'tasks');
    const unsubTasks = onSnapshot(tasksRef, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    });

    return () => {
      unsubProject();
      unsubTasks();
    };
  }, [selectedProject]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    await addDoc(collection(db, 'projects', selectedProject.id, 'tasks'), {
      title: newTask
    });
    setNewTask('');
  };

  const handleDelete = async (taskId) => {
    await deleteDoc(doc(db, 'projects', selectedProject.id, 'tasks', taskId));
  };

  if (!selectedProject) return <Text>No project selected.</Text>;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{selectedProject.name} - Tasks</Text>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text>No tasks found for this project.</Text>}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 }}>
            <Text>{item.title}</Text>
            <Button title="Delete" onPress={() => handleDelete(item.id)} />
          </View>
        )}
      />

      <TextInput
        placeholder="New task title"
        value={newTask}
        onChangeText={setNewTask}
        style={{ borderWidth: 1, marginVertical: 10, padding: 8 }}
      />
      <Button title="Add Task" onPress={handleAddTask} />
    </View>
  );
}
