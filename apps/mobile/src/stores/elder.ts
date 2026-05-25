import { defineStore } from 'pinia'
import { getElderProfile } from '@/services/elderService'

export const useElderStore = defineStore('elder', {
  state: () => ({
    profile: getElderProfile(),
    selectedContactId: '',
    contactActionMessage: '',
    relayMessage: '我今天挺好的，晚饭后想出去走走。',
    sentRelayMessage: ''
  }),
  getters: {
    primaryContact: (state) => state.profile.emergencyContacts[0],
    onlineContactCount: (state) => state.profile.emergencyContacts.filter((item) => item.onlineStatus === 'online').length,
    selectedContact(state) {
      return state.profile.emergencyContacts.find((item) => item.id === state.selectedContactId) ?? state.profile.emergencyContacts[0]
    },
    contactById: (state) => (id: string) => state.profile.emergencyContacts.find((item) => item.id === id)
  },
  actions: {
    selectContact(id: string) {
      this.selectedContactId = id
    },
    simulateContactAction(action: 'phone' | 'video' | 'message', contactId?: string) {
      if (contactId) this.selectedContactId = contactId
      const contact = this.selectedContact
      const actionText = { phone: '电话', video: '视频', message: '消息' }[action]
      this.contactActionMessage = `已向${contact.relation}发起${actionText}请求`
    },
    sendRelayMessage(message?: string, contactId?: string) {
      if (contactId) this.selectedContactId = contactId
      const content = message || this.relayMessage
      this.sentRelayMessage = content
      this.contactActionMessage = `已把消息发送给${this.selectedContact.relation}`
    }
  }
})
