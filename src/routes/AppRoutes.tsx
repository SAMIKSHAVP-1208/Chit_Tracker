import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { AuctionsPage } from '../pages/AuctionsPage'
import { ChitGroupWorkspacePage, ChitGroupsPage } from '../pages/ChitGroupsPage'
import { CollectionsPage } from '../pages/CollectionsPage'
import { DashboardPage } from '../pages/DashboardPage'
import { MembersPage } from '../pages/MembersPage'
import { SettingsPage } from '../pages/SettingsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="chit-groups" element={<ChitGroupsPage />} />
        <Route
          path="chit-groups/workspace/:tab?"
          element={<ChitGroupWorkspacePage />}
        />
        <Route path="members" element={<MembersPage />} />
        <Route path="auctions" element={<AuctionsPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  )
}
