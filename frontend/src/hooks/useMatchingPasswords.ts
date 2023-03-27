const useMatchingPasswords = (password: string, confirmPassword: string) => {
    return password === confirmPassword;
}

export default useMatchingPasswords;