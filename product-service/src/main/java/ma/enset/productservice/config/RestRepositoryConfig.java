package ma.enset.productservice.config;
import ma.enset.productservice.entities.Product;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistration;

@Configuration
public class RestRepositoryConfig implements RepositoryRestConfigurer{
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistration cors){
        config.exposeIdsFor(Product.class);
    }
}
