// import React from 'react'

// interface LoadingSpinnerProps {
//   size?: 'sm' | 'md' | 'lg'
//   text?: string
// }

// const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
//   const sizeClasses = {
//     sm: 'h-6 w-6',
//     md: 'h-10 w-10',
//     lg: 'h-16 w-16'
//   }

//   const textSizeClasses = {
//     sm: 'text-xs',
//     md: 'text-sm',
//     lg: 'text-base'
//   }

//   return (
//     <div className="flex flex-col items-center justify-center p-6">
//       <div className="relative">
//         <div
//           className={`animate-spin rounded-full ${sizeClasses[size]} border-4 border-primary-200`}
//           style={{
//             borderTopColor: 'var(--color-primary-500)'
//           }}
//         ></div>
//         <div className={`absolute inset-0 animate-pulse rounded-full ${sizeClasses[size]} bg-gradient-to-r from-primary-100 to-primary-200 opacity-20`}></div>
//       </div>
//       {text && (
//         <p className={`mt-4 ${textSizeClasses[size]} font-medium text-primary-700 animate-pulse`}>
//           {text}
//         </p>
//       )}
//     </div>
//   )
// }

// export default LoadingSpinner

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  return (
    <div className={`qa-spinner qa-spinner--${size}`}>
      <div className="qa-spinner__wrap" aria-label="Loading" role="status">
        <div className="qa-spinner__ring" />
        <div className="qa-spinner__glow" />
      </div>
      {text && <p className="qa-spinner__text">{text}</p>}
    </div>
  )
}

export default LoadingSpinner