package com.deloitte.absolute_cinema.service;

import com.stripe.StripeClient;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class StripeService {
    
    private final StripeClient stripeClient;
    
    public StripeService(@Value("${stripe.secret.key}") String secretKey) {
        this.stripeClient = new StripeClient(secretKey);
    }
    
    public PaymentIntent createPaymentIntent(BigDecimal amount, String currency) throws StripeException {
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
                .setCurrency(currency)
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .build();
        
        return stripeClient.paymentIntents().create(params);
    }
    
    public PaymentIntent confirmPaymentIntent(String paymentIntentId) throws StripeException {
        return stripeClient.paymentIntents().confirm(paymentIntentId);
    }
    
    public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
        return stripeClient.paymentIntents().retrieve(paymentIntentId);
    }
}
