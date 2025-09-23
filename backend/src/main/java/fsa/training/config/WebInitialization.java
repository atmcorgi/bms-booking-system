package fsa.training.config;

import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;
import jakarta.servlet.MultipartConfigElement;
import jakarta.servlet.ServletRegistration;

public class WebInitialization extends AbstractAnnotationConfigDispatcherServletInitializer {
    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{
            JpaConfig.class,
            SecurityConfig.class
        } ;
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{WebConfig.class};
    }

    @Override
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }

    @Override
    protected void customizeRegistration(ServletRegistration.Dynamic registration) {
        // Configure multipart for DispatcherServlet (Servlet 3+)
        String location = System.getProperty("java.io.tmpdir");
        long maxFileSize = 20 * 1024 * 1024;      // 20MB
        long maxRequestSize = 40 * 1024 * 1024;   // 40MB
        int fileSizeThreshold = 0;
        registration.setMultipartConfig(new MultipartConfigElement(location, maxFileSize, maxRequestSize, fileSizeThreshold));
    }
}