// import React, { useState } from 'react'
// import { Link, useNavigate, useLocation } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import {
//   HiChartBar,
//   HiPlus,
//   HiCog,
//   HiUser,
//   HiArrowRightOnRectangle,
//   HiArrowLeftOnRectangle,
//   HiBars3,
//   HiXMark,
//   HiSparkles
// } from 'react-icons/hi2'

// interface LayoutProps {
//   children: React.ReactNode
// }

// const Layout: React.FC<LayoutProps> = ({ children }) => {
//   const { user, signOut } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

//   const handleSignOut = async () => {
//     await signOut()
//     navigate('/')
//     setMobileMenuOpen(false)
//   }

//   const navigation = [
//     { name: 'Dashboard', href: '/dashboard', icon: HiChartBar },
//     { name: 'Create Quiz', href: '/create-quiz', icon: HiPlus },
//     { name: 'Study Assistant', href: '/study-assistant', icon: HiCog },
//     { name: 'Settings', href: '/settings', icon: HiCog },
    
//   ]
  

//   const isActive = (href: string) => location.pathname === href

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 flex flex-col">
//       {/* Navigation */}
//       <nav className="bg-white/90 backdrop-blur-lg border-b border-green-200/50 sticky top-0 z-50 shadow-soft">
//         <div className="max-w-7xl mx-auto container-padding">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo */}
//             <Link to="/" className="flex items-center space-x-3 group animate-fade-in">
//               <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-soft">
//                 <HiSparkles className="w-6 h-6 text-white" />
//               </div>
//               <span className="text-2xl font-bold text-gradient">
//                 QuizAI
//               </span>
//             </Link>


//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center space-x-2">
//               {user && navigation.map((item) => {
//                 const Icon = item.icon
//                 return (
//                   <Link
//                     key={item.name}
//                     to={item.href}
//                     className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
//                       isActive(item.href)
//                         ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-soft'
//                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//                     }`}
//                   >
//                     <Icon className="w-4 h-4" />
//                     <span>{item.name}</span>
//                   </Link>
//                 )
//               })}
//             </div>

//             {/* User Menu */}
//             <div className="flex items-center space-x-4">
//               {user ? (
//                 <div className="flex items-center space-x-3">
//                   <div className="hidden sm:flex items-center space-x-2">
//                     {user.isGuest && (
//                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800 border border-warning-200">
//                         Guest Mode
//                       </span>
//                     )}
//                     {user.email && (
//                       <div className="flex items-center space-x-2 text-sm text-gray-600">
//                         <HiUser className="w-4 h-4" />
//                         <span className="truncate max-w-32 font-medium">{user.email}</span>
//                       </div>
//                     )}
//                   </div>
//                   <button
//                     onClick={handleSignOut}
//                     className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
//                   >
//                     <HiArrowRightOnRectangle className="w-4 h-4" />
//                     <span className="hidden sm:inline">Sign Out</span>
//                   </button>
//                 </div>
//               ) : (
//                 <Link
//                   to="/login"
//                   className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-lg text-sm font-medium hover:from-primary/90 hover:to-secondary/90 transition-all shadow-sm hover:shadow-md"
//                 >
//                   <HiArrowLeftOnRectangle className="w-4 h-4" />
//                   <span>Sign In</span>
//                 </Link>
//               )}

//               {/* Mobile menu button */}
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="md:hidden p-2 rounded-lg text-on-background/60 hover:text-on-background hover:bg-surface-200 transition-colors"
//               >
//                 {mobileMenuOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {mobileMenuOpen && (
//           <div className="md:hidden border-t border-gray-200 bg-surface/95 backdrop-blur-lg">
//             <div className="px-4 py-3 space-y-1">
//               {user && navigation.map((item) => {
//                 const Icon = item.icon
//                 return (
//                   <Link
//                     key={item.name}
//                     to={item.href}
//                     onClick={() => setMobileMenuOpen(false)}
//                     className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
//                       isActive(item.href)
//                         ? 'bg-primary/10 text-primary border border-primary/20'
//                         : 'text-on-background/60 hover:text-on-background hover:bg-surface-200'
//                     }`}
//                   >
//                     <Icon className="w-5 h-5" />
//                     <span>{item.name}</span>
//                   </Link>
//                 )
//               })}

//               {user && (
//                 <div className="border-t border-gray-200 pt-3 mt-3">
//                   <div className="flex items-center space-x-3 px-3 py-2">
//                     <HiUser className="w-5 h-5 text-gray-400" />
//                     <div className="flex-1 min-w-0">
//                       {user.isGuest ? (
//                         <span className="text-sm text-amber-600 font-medium">Guest Mode</span>
//                       ) : (
//                         <span className="text-sm text-on-background/70 truncate">{user.email}</span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* Main Content */}
//       <main className="flex-1 flex items-center justify-center w-full py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
//         <div className="w-full max-w-4xl">
//           {children}
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-white/80 border-t border-green-200/50 mt-auto backdrop-blur-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
//             <div className="flex items-center space-x-2">
//               <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-green-500 rounded flex items-center justify-center">
//                 <HiSparkles className="w-4 h-4 text-white" />
//               </div>
//               <span className="text-sm text-green-700">© 2025 QuizAI. Powered by AI.</span>
//             </div>
//             <div className="flex items-center space-x-6 text-sm text-green-600">
//               <span>Made with ❤️ for learners</span>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   )
// }

// export default Layout

import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  HiChartBar,
  HiPlus,
  HiUser,
  HiArrowRightOnRectangle,
  HiArrowLeftOnRectangle,
  HiBars3,
  HiXMark,
  HiSparkles,
  HiChatBubbleLeftRight,
  HiCog6Tooth,
  HiHeart
} from 'react-icons/hi2'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HiChartBar },
    { name: 'Create Quiz', href: '/create-quiz', icon: HiPlus },
    { name: 'Study Assistant', href: '/study-assistant', icon: HiChatBubbleLeftRight },
    { name: 'Settings', href: '/settings', icon: HiCog6Tooth }
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <div className="qa-shell">
      <nav className="qa-nav">
        <div className="qa-container">
          <div className="qa-nav__bar">
            <Link to="/" className="qa-brand qa-fadeIn">
              <div className="qa-brand__mark" aria-hidden="true">
                <HiSparkles className="qa-ico qa-ico--brand" />
              </div>
              <span className="qa-brand__name">QuizAI</span>
            </Link>

            <div className="qa-nav__links" aria-label="Primary navigation">
              {user &&
                navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`qa-navlink ${isActive(item.href) ? 'qa-navlink--active' : ''}`}
                    >
                      <Icon className="qa-ico qa-ico--nav" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
            </div>

            <div className="qa-user">
              {user ? (
                <>
                  <div className="qa-user__meta">
                    {user.isGuest && <span className="qa-badge qa-badge--warning">Guest Mode</span>}

                    {user.email && (
                      <div className="qa-userpill" title={user.email}>
                        <HiUser className="qa-ico qa-ico--btn" />
                        <span className="qa-truncate">{user.email}</span>
                      </div>
                    )}
                  </div>

                  <button onClick={handleSignOut} className="qa-btn qa-btn--ghost">
                    <HiArrowRightOnRectangle className="qa-ico qa-ico--btn" />
                    <span className="qa-user__meta">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="qa-btn qa-btn--primary">
                  <HiArrowLeftOnRectangle className="qa-ico qa-ico--btn" />
                  <span>Sign In</span>
                </Link>
              )}

              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="qa-btn qa-btn--surface qa-iconBtn qa-mobileToggle"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? (
                    <HiXMark className="qa-ico qa-ico--lg" />
                  ) : (
                    <HiBars3 className="qa-ico qa-ico--lg" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {user && mobileMenuOpen && (
          <div className="qa-mobilePanel">
            <div className="qa-container">
              <div className="qa-mobilePanel__inner">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`qa-mobileNavLink ${
                        isActive(item.href) ? 'qa-mobileNavLink--active' : ''
                      }`}
                    >
                      <Icon className="qa-ico qa-ico--lg" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}

                <div className="qa-divider" />

                <div className="qa-mobileNavLink" style={{ cursor: 'default' }}>
                  <HiUser className="qa-ico qa-ico--lg" />
                  <div className="qa-truncate" style={{ fontWeight: 900 }}>
                    {user.isGuest ? 'Guest Mode' : user.email}
                  </div>
                </div>

                <button onClick={handleSignOut} className="qa-btn qa-btn--ghost" style={{ justifyContent: 'flex-start' }}>
                  <HiArrowRightOnRectangle className="qa-ico qa-ico--btn" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="qa-main qa-fadeIn">
        <div className="qa-main__inner">{children}</div>
      </main>

      <footer className="qa-footer">
        <div className="qa-container">
          <div className="qa-footer__inner">
            <div className="qa-footer__brand">
              <div className="qa-footer__mark" aria-hidden="true">
                <HiSparkles className="qa-ico qa-ico--btn" />
              </div>
              <span>© 2025 QuizAI. Powered by AI.</span>
            </div>

            <div className="qa-footer__note">
              <HiHeart className="qa-ico qa-ico--btn" style={{ color: 'var(--qa-danger)' }} />
              <span>Made for learners</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout