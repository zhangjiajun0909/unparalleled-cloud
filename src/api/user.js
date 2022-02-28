import request from '@/utils/request'
import requestTest from '@/utils/request-test'

export function getList(params) {
  return requestTest({
    url: 'v1/user-center/list',
    method: 'get',
    params: params
  })
}

export function addUser(data) {
  return requestTest({
    url: 'v1/user-center/user/add',
    method: 'post',
    data
  })
}

export function getDeviceList() {
  return requestTest({
    url: 'v1/device/list',
    method: 'get'
  })
}

// 获取异常列表
export function getAbnormalList(data) {
  return requestTest({
    url: `v1/abnormal/list/${data.id}?pageNum=${data.pageNum}&pageSize=${data.pageSize}`,
    method: 'get'
  })
}

export function deleteUser(userId) {
  return requestTest({
    url: `v1/user-center/user/${userId}/invalid`,
    method: 'post'
  })
}

export function getRealTimeCardiogram(data) {
  return requestTest({
    url: `v1/cardiogram/realTime`,
    method: 'post',
    data
  })
}

export function getSingleList(deviceId) {
  return requestTest({
    url: `v1/device/${deviceId}`,
    method: 'get'
  })
}

//
export function getChannels() {
  return requestTest({
    url: `v1/device/channels`,
    method: 'get'
  })
}

export function login(data) {
  return request({
    url: '/vue-element-admin/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-element-admin/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}
