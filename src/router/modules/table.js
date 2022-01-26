/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/user',
  component: Layout,
  redirect: '/table/complex-table',
  name: 'Table',
  meta: {
    title: '用户中心',
    icon: 'user'
  },
  children: [
    {
      path: 'dynamic-table',
      component: () => import('@/views/table/dynamic-table/index'),
      name: 'DynamicTable',
      meta: { title: 'Dynamic Table' },
      hidden: true
    },
    {
      path: 'drag-table',
      component: () => import('@/views/table/drag-table'),
      name: 'DragTable',
      meta: { title: 'Drag Table' },
      hidden: true
    },
    {
      path: 'user-list',
      component: () => import('@/views/table/complex-table'),
      name: 'ComplexTable',
      meta: { title: '用户列表' }
    }
  ]
}
export default tableRouter
