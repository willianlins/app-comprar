import AsyncStorage from "@react-native-async-storage/async-storage";
import { FilterStatus } from '@/types/FilterStatus'

const ITEMS_STORAGE_KEY = '@comprar:items'

export type ItemStorage = {
  id: string,
  status: FilterStatus,
  description: string
}

async function get(): Promise<ItemStorage[]>{
  try{
    const storage = await AsyncStorage.getItem(ITEMS_STORAGE_KEY)

    return storage ? JSON.parse(storage) : []
  }catch(error){
    throw new Error("ITEMS_GET:" + error)
  }
}

async function getByStatus(status: FilterStatus): Promise<ItemStorage[]>{
  const items = await get()

  return items.filter((item) => item.status === status)
}

async function save(items: ItemStorage[]): Promise<void>{
  try{  
    await AsyncStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
  }catch(error){
    throw new Error("ITEMS_SAVE:" + error)
  }
}

async function add(newItem: ItemStorage): Promise<ItemStorage[]>{
  const item = await get()
  const updateItems = [...item, newItem]

  await save(updateItems)

  return updateItems
}

async function remove(id: string): Promise<void>{
  const items = await get()
  const updateItems = items.filter((item) => item.id !== id)
  await save(updateItems)
}

async function clear(): Promise<void>{
  try{
    await AsyncStorage.removeItem(ITEMS_STORAGE_KEY)
  }catch(error){
    throw new Error('ITEMS_CLEAR: ' + error)
  }
}

async function toggleStatus(id: string): Promise<void> {
  const items = await get()

  const updateItems = items.map(item => 
    item.id === id ? {
      ...item,
      status: item.status === FilterStatus.PENDING ? FilterStatus.DONE : FilterStatus.PENDING
    }
    : item
  )

  await save(updateItems)
}

export const itemsStorage = {
  get,
  getByStatus,
  add,
  remove,
  clear,
  toggleStatus
}