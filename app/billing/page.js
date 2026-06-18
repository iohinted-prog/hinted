    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/billing?saved=1`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || "Failed to save card.");
      setSubmitting(false);
      return;
    }

    if (result.setupIntent?.status === "succeeded") {
      router.push("/billing?saved=1");
      router.refresh();
      return;
    }

    setError("Card setup did not complete.");
    setSubmitting(false);
