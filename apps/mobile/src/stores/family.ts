import { defineStore } from 'pinia'
import { getFamilyProfile } from '@/services/familyService'

export const useFamilyStore = defineStore('family', {
  state: () => ({
    profile: getFamilyProfile()
  })
})
