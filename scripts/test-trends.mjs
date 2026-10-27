import assert from 'node:assert/strict'
import { parseMetricValue, normalizeHistory, historyKey, mockRecordTime } from '../apps/mobile/src/utils/trends.ts'
assert.deepEqual(parseMetricValue('bloodPressure','128/82 mmHg'),[128,82])
assert.equal(parseMetricValue('bloodPressure','82/128'),null)
assert.equal(parseMetricValue('bloodPressure','128'),null)
assert.equal(parseMetricValue('heartRate','78garbage'),null)
assert.equal(parseMetricValue('sleep','25 小时'),null)
assert.deepEqual(parseMetricValue('sleep','7.5 小时'),[7.5])
const now=Date.parse('2026-10-26T12:00:00Z')
const data=normalizeHistory({elderId:'a',metric:'bloodPressure',days:7,source:'api',rows:[
 {recorded_at:'2026-10-25T08:00:00Z',value:'128/82',status:'warning'},
 {recorded_at:'bad',value:'128/82',status:'normal'},
 {recorded_at:'2026-10-24T08:00:00Z',value:'124/80',status:'normal'},
 {recorded_at:'2026-10-24T08:00:00Z',value:'125/81',status:'normal'},
 {recorded_at:'2026-09-01T08:00:00Z',value:'124/80',status:'normal'},
 {recorded_at:'2026-10-27T08:00:00Z',value:'124/80',status:'normal'},
 {recorded_at:'2026-10-25T09:00:00Z',value:'NaN',status:'danger'}
]},now)
assert.equal(data.points.length,2);assert.equal(data.invalidCount,2)
assert.deepEqual(data.points[0].values,[125,81]);assert.equal(data.points[1].status,'warning')
assert.equal(data.source,'api');assert.equal(data.unit,'mmHg')
const keys=new Set([historyKey('api','a','sleep',7),historyKey('api','b','sleep',7),historyKey('api','a','sleep',1),historyKey('api','a','heartRate',7),historyKey('mock','a','sleep',7)])
assert.equal(keys.size,5)
assert.equal(normalizeHistory({elderId:'b',metric:'sleep',days:7,source:'mock',rows:[]},now).points.length,0)
assert.ok(Date.parse(mockRecordTime('昨天 20:30',new Date(now)))<now)
console.log('PASS: 16 trend assertions (BP split, invalid data, window, ordering, deduplication, source, elder/metric/range isolation, empty data).')
