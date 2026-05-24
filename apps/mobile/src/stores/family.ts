import { defineStore } from 'pinia'
import { familyProfile } from '@/mock/family'

export const useFamilyStore = defineStore('family', {
  state: () => ({
    profile: familyProfile
  })
})
