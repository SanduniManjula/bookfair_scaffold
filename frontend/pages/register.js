import Navbar from "../components/Navbar";
import RegistrationForm from "../components/RegistrationForm";
import GlobalStyles from "../components/GlobalStyles";

export default function Register() {
  return (
    <div style={styles.page}>
      <GlobalStyles />
      <Navbar />
      <RegistrationForm />
    </div>
  );
}

const styles = {
  page: {
    margin: 0,
    padding: 0,
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    overflowX: "hidden",
  },
};
