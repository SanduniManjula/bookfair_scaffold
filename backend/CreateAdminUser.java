import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class CreateAdminUser {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = args.length > 0 ? args[0] : "admin123";
        String hashed = encoder.encode(password);
        System.out.println("Hashed password for '" + password + "':");
        System.out.println(hashed);
    }
}

