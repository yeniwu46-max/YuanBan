import { useAlertStore } from '@/stores/alert'
import { useCommunityWorkorderStore } from '@/stores/communityWorkorder'
import { useElderStore } from '@/stores/elder'
import { syncFamilyDerivedState } from '@/stores/familySync'
/** Session-local demo event. Never sends a real notification or claims receipt. */
export function emitDemoSos(elderId: string) {
  const id = 'demo-sos-' + Date.now(),
    elder = useElderStore().profile
  const title = elder.name + '发起 SOS 求助',
    description = '演示求助 · ' + elder.locationLabel
  useAlertStore().alerts.unshift({
    id,
    elderId,
    type: 'sos',
    level: 'high',
    icon: 'siren',
    title,
    description,
    detail: description,
    timeLabel: '刚刚',
    status: 'pending',
    statusLabel: '待处理',
    tag: '紧急',
    tagTone: 'red',
    timeline: [
      { id: id + '-sent', title: '收到演示求助', detail: '刚刚 · 老人端主动发起', done: true },
      {
        id: id + '-follow',
        title: '等待家人核实',
        detail: '请联系长辈确认情况',
        done: false,
        pending: true,
      },
    ],
    suggestion: '请先联系长辈确认安全，再记录处理结果。',
  })
  const workorder = useCommunityWorkorderStore()
  workorder.orders.unshift({
    id,
    code: 'SOS-' + id.slice(-6),
    tab: 'urgent',
    icon: 'siren',
    iconTone: 'red',
    title,
    description,
    tag: '待响应',
    tagTone: 'red',
    elderId,
    status: 'pending',
  })
  workorder.poolStats.pendingCount++
  workorder.poolStats.urgentCount++
  workorder.poolStats.totalCount++
  syncFamilyDerivedState()
  return id
}
