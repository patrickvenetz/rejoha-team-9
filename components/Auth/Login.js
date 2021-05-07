import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/router'

import { gql, useMutation } from '@apollo/client'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import LinearProgress from '@material-ui/core/LinearProgress'

import withMe, { queryWithMe, MeFragment } from '../../libs/withMe'
import MutationError from '../../components/commons/MutationError'

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      ...MeFragment
    }
  }

  ${MeFragment}
`

const AuthLogin = (props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const router = useRouter()

  useEffect(() => {
    if (props.me) {
      router.push('/')
    }
  }, [props.me])

  const [login, { loading: loginLoading, error: loginError }] = useMutation(
    LOGIN,
    {
      errorPolicy: 'all',
      update: (cache, { data: { login: me } }) => {
        cache.writeQuery({
          query: queryWithMe,
          data: { me },
        })
      },
    },
  )

  if (props.me || props.meLoading) {
    return <LinearProgress variant="query" />
  }

  const onSubmit = handleSubmit((variables) => {
    login({ variables })
  })

  return (
    <form onSubmit={onSubmit}>
      <TextField
        fullWidth
        margin="normal"
        variant="outlined"
        label="Nutzername"
        {...register('username', {
          required: 'Nutzername zwingend erforderlich',
        })}
        error={!!errors.username}
        helperText={errors.username?.message}
      />
      <TextField
        fullWidth
        margin="normal"
        variant="outlined"
        label="Passwort"
        type="password"
        {...register('password', {
          required: 'Passwort zwingend erforderlich',
        })}
        error={!!errors.password}
        helperText={errors.password?.message}
      />
      <Button
        size="large"
        variant="contained"
        color="primary"
        type="submit"
        disabled={loginLoading}
      >
        Anmelden
      </Button>
      {loginLoading && <LinearProgress variant="query" />}
      <MutationError
        title="Anmeldefehler"
        content="Daten nicht gefunden. Bitte prüfen Sie Ihre Eingaben und versuchen Sie es erneut."
        apolloError={loginError}
      />
    </form>
  )
}

export default withMe(AuthLogin)
