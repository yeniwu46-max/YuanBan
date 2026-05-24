import { defineStore } from 'pinia'
import { elderProfile } from '@/mock/elder'

export const useElderStore = defineStore('elder', {
  state: () => ({
    profile: elderProfile
  }),
  getters: {
    primaryContact: (state) => state.profile.emergencyContacts[0],
    onlineContactCount: (state) => state.profile.emergencyContacts.filter((item) => item.onlineStatus === 'online').length
  }
})

