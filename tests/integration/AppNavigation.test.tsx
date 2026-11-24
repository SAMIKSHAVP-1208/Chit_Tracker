import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from '../../src/routes/AppRoutes'

describe('application navigation', () => {
  it('shows only the six requested main navigation items', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    const navigation = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(within(navigation).getAllByRole('link')).toHaveLength(6)
    expect(within(navigation).getByRole('link', { name: 'Dashboard' })).toBeVisible()
    expect(
      within(navigation).getByRole('link', { name: 'Collections & Payments' }),
    ).toBeVisible()
  })

  it('opens the group workspace and navigates its five sections', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/chit-groups']}>
        <AppRoutes />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('link', { name: 'Preview group workspace' }))
    const groupNavigation = screen.getByRole('navigation', {
      name: 'Chit group sections',
    })
    expect(within(groupNavigation).getAllByRole('link')).toHaveLength(5)

    await user.click(within(groupNavigation).getByRole('link', { name: 'Members' }))
    expect(screen.getByRole('heading', { name: 'Group members' })).toBeVisible()
  })

  it('renders the member and collections pages through the main navigation', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>,
    )
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' })

    await user.click(within(navigation).getByRole('link', { name: 'Members' }))
    expect(screen.getByRole('heading', { name: 'Customer directory' })).toBeVisible()

    await user.click(
      within(navigation).getByRole('link', { name: 'Collections & Payments' }),
    )
    expect(screen.getByRole('heading', { name: 'Collections & Payments' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Winner payouts' })).toBeVisible()
  })
})
