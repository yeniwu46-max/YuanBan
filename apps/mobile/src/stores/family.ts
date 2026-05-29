import { defineStore } from 'pinia'
import { familyProfile } from '@/mock/family'
import { mockClone } from '@/services/mockClone'

export const useFamilyStore = defineStore('family', {
  state: () => ({
    profile: mockClone(familyProfile)
  })
})
