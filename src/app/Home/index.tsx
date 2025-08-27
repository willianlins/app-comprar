import { View, Image, TouchableOpacity, Text, FlatList, Alert } from 'react-native'
import { useEffect, useState } from 'react'

import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Filter } from '@/components/Filter'
import { FilterStatus } from '@/types/FilterStatus'
import { Item } from '@/components/Item'
import { ItemStorage, itemsStorage } from '@/storage/itemsStorage'

import { styles } from './styles'

const FILTER_STATUS: FilterStatus[] = [FilterStatus.PENDING, FilterStatus.DONE]


export function Home(){
  const [filter, setFilter] = useState(FilterStatus.PENDING)
  const [description, setDescription] = useState("")
  const [items, setItems] = useState<ItemStorage[]>()

  async function handleAdd(){
    if(!description.trim()){
      return Alert.alert("Adicionar", 'Informe a descrição para salvar.')
    }

    const newItem = {
      id: Math.random().toString(36).substring(2),
      description,
      status: FilterStatus.PENDING,
    }

    await itemsStorage.add(newItem)
    await itemsByStatus()

    Alert.alert('Adicionado', `Adicionado ${description}`)
    setDescription('')
    setFilter(FilterStatus.PENDING)
  }
 
  async function itemsByStatus(){
    try{
      const response = await itemsStorage.getByStatus(filter)
      setItems(response)
    }catch(error){
      Alert.alert("Error", 'Não foi possível filtrar os itens.')
    }
  }

  async function handleRemove(id: string){
    console.log(id)
    try{
      await itemsStorage.remove(id)
      await itemsByStatus()
    }catch(error){
      Alert.alert("Remover", "Não foi possivel remover.")
    }
  }

  function hedleClear(){
    Alert.alert('Limpar', 'Deseja remover todos?', [
      {text: "Não", style: "cancel"},
      {text: "Sim", onPress: () => onClear()}
    ])
  }

  async function onClear(){
    try{
      await itemsStorage.clear()
      setItems([])
    }catch(error){
      Alert.alert("Error", "Não foi possivel remover todos os items.")
    }
  }

  async function handleToggleItemStatus(id: string){
    try{
      await itemsStorage.toggleStatus(id)
      await itemsByStatus()
    } catch(error){
      Alert.alert('Erro','Não foi possivel atualizar o staus.')
    }
  }

  useEffect(() => {
    itemsByStatus()
  }, [filter])

  return(
    <View style={styles.container}>
      <Image style={styles.logo} source={require("@/assets/logo.png")} />

      <View style={styles.form}>
        <Input
          placeholder='O que você precisa comprar?'
          onChangeText={setDescription}
          value={description}
        />
        <Button  title='Adicionar' onPress={handleAdd}/>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          {FILTER_STATUS.map((status) => (
            <Filter 
              key={status} 
              status={status} 
              onPress={()=>  setFilter(status)}
              isActive={status === filter}
            />
          ))}  

          <TouchableOpacity style={styles.clearButtom} onPress={hedleClear}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>                
        </View>

        <FlatList
          data={items}
          keyExtractor={(item)=> item.id}
          renderItem={({item})=> (
            <Item 
              data={item}
              onRemove={()=> handleRemove(item.id)}
              onStatus={()=> handleToggleItemStatus(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={()=> <View style={styles.separator}/>}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={()=> <Text style={styles.empty}>Nenhum item aqui</Text>}
        />
      </View>
    </View>
  )
}

