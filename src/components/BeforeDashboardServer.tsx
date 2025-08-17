import type { ServerComponentProps } from 'payload'

import styles from './BeforeDashboardServer.module.css'

export const BeforeDashboardServer = async (props: ServerComponentProps) => {
  const { payload } = props


  return (
    <div className={styles.wrapper}>
      <h1>Added by the plugin: Before Dashboard Server</h1>
      Docs from Local API:
    </div>
  )
}
