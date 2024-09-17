'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'
import * as yup from 'yup'

// Type Imports
import type { SystemMode } from '@core/types'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { useState } from 'react'
import { authnetication } from '@/services/endpoint/auth'
import { toast } from 'react-toastify'
const API_URL = process.env.NEXT_PUBLIC_API_URL
// API Call
const forgotPasswordAPI = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/${authnetication.forgot_password}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      // Handle non-200 responses
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to send reset password email')
    }

    // Parse and return the response data
    const data = await response.json()
    return data
  } catch (error: any) {
    console.error('Error during forgot password API call:', error.message)
    throw error
  }
}

// Validation Schema
const validationSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required')
})

// Styled Custom Components
const ForgotPasswordIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 650,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const ForgotPassword = ({ mode }: { mode: SystemMode }) => {
  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-forgot-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-forgot-password-light.png'

  // Hooks
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)
  const characterIllustration = useImageVariant(mode, lightIllustration, darkIllustration)

  // State Management
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // eslint-disable-next-line no-undef
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatus(null)

    // Validate email
    try {
      await validationSchema.validate({ email })
    } catch (validationError: any) {
      setError(validationError.message)
      return
    }

    setIsSubmitting(true)

    // API Call
    try {
      await forgotPasswordAPI(email)
      // setStatus('Reset link sent successfully!')
      toast.success('Reset link sent successfully!')
    } catch (apiError: any) {
      setError(apiError.message)
      toast.error(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <ForgotPasswordIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <div className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </div>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>Forgot Password 🔒</Typography>
            <Typography>Enter your email and we&#39;ll send you instructions to reset your password</Typography>
          </div>
          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-6'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(error)}
              helperText={error}
            />
            <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
            {status && (
              <Typography className='flex justify-center items-center' color='primary'>
                {status}
              </Typography>
            )}
            <Typography className='flex justify-center items-center' color='primary'>
              <Link href={'/login'} className='flex items-center gap-1.5'>
                <span>Back to login</span>
              </Link>
            </Typography>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

// 'use client'

// // React Imports
// import { useState } from 'react'

// // Next Imports
// import Link from 'next/link'
// import { useParams } from 'next/navigation'

// // MUI Imports
// import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
// import Typography from '@mui/material/Typography'
// import IconButton from '@mui/material/IconButton'
// import InputAdornment from '@mui/material/InputAdornment'
// import Button from '@mui/material/Button'

// import Logo from '@components/layout/shared/Logo'
// import CustomTextField from '@core/components/mui/TextField'

// // Styled Component Imports
// import AuthIllustrationWrapper from './AuthIllustrationWrapper'

// const ResetPasswordV1 = () => {
//   // States
//   const [isPasswordShown, setIsPasswordShown] = useState(false)
//   const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)

//   // Hooks
//   const { lang: locale } = useParams()

//   const handleClickShowPassword = () => setIsPasswordShown(show => !show)

//   const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

//   return (
//     <AuthIllustrationWrapper>
//       <Card className='flex flex-col sm:is-[450px]'>
//         <CardContent className='sm:!p-12'>
//           <div className='flex justify-center mbe-6'>
//             <Logo />
//           </div>
//           <div className='flex flex-col gap-1 mbe-6'>
//             <Typography variant='h4'>Reset Password 🔒</Typography>
//             <Typography>Your new password must be different from previously used passwords</Typography>
//           </div>
//           <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-6'>
//             <CustomTextField
//               autoFocus
//               fullWidth
//               label='New Password'
//               placeholder='············'
//               type={isPasswordShown ? 'text' : 'password'}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position='end'>
//                     <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
//                       <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
//                     </IconButton>
//                   </InputAdornment>
//                 )
//               }}
//             />
//             <CustomTextField
//               fullWidth
//               label='Confirm Password'
//               placeholder='············'
//               type={isConfirmPasswordShown ? 'text' : 'password'}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position='end'>
//                     <IconButton
//                       edge='end'
//                       onClick={handleClickShowConfirmPassword}
//                       onMouseDown={e => e.preventDefault()}
//                     >
//                       <i className={isConfirmPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
//                     </IconButton>
//                   </InputAdornment>
//                 )
//               }}
//             />
//             <Button fullWidth variant='contained' type='submit'>
//               Set New Password
//             </Button>
//             <Typography className='flex justify-center items-center' color='primary'>
//               <Link
//                 href={'pages/auth/login-v1'}
//                 className='flex items-center gap-1.5'
//               >
//                 {/* <DirectionalIcon
//                   ltrIconClass='tabler-chevron-left'
//                   rtlIconClass='tabler-chevron-right'
//                   className='text-xl'
//                 /> */}
//                 <span>Back to login</span>
//               </Link>
//             </Typography>
//           </form>
//         </CardContent>
//       </Card>
//     </AuthIllustrationWrapper>
//   )
// }

// export default ResetPasswordV1
