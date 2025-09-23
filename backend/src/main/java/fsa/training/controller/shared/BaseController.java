package fsa.training.controller.shared;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class BaseController {

    @GetMapping("/403")
    public String accessDenied() {
        return "shared/403";
    }
}