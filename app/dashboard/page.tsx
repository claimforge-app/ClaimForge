import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("resolveforge_user_id")?.value || null;

  // If not logged in, show message + link to login
  if (!userId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#000",
          padding: "2rem",
          color: "#f9fafb",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "#facc15",
              textAlign: "center",
            }}
          >
            Your Claims
          </h1>
          <p
            style={{
              textAlign: "center",
              opacity: 0.8,
              marginBottom: "1rem",
            }}
          >
            You need to sign in to view your claims history.
          </p>
          <div style={{ textAlign: "center" }}>
            <a
              href="/login"
              style={{
                display: "inline-block",
                padding: "0.6rem 1.1rem",
                borderRadius: "999px",
                border: "1px solid #1f2937",
                backgroundColor: "#facc15",
                color: "#000",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
              }}
            >
              Go to login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Logged in → load only this user's claims
  const { data: claims, error } = await supabaseAdmin
    .from("claims")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading claims:", error);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        padding: "2rem",
        color: "#f9fafb",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "#facc15",
            }}
          >
            Your Claims
          </h1>

          <a
            href="/"
            style={{
              padding: "0.6rem 1.1rem",
              borderRadius: "999px",
              border: "1px solid #1f2937",
              backgroundColor: "#facc15",
              color: "#000",
              fontWeight: 600,
              fontSize: "0.95rem",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Start new claim
          </a>
        </div>

        {(!claims || claims.length === 0) && (
          <p style={{ textAlign: "center", opacity: 0.7 }}>
            You haven&apos;t submitted any claims yet.
          </p>
        )}

        {claims?.map((claim) => (
          <a
            key={claim.id}
            href={`/claim/${claim.id}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                backgroundColor: "#0a0a0a",
                padding: "1.25rem",
                borderRadius: "12px",
                border: "1px solid #1f2937",
                marginBottom: "1rem",
                transition: "all 0.25s ease",
              }}
            >
              <h2
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  marginBottom: "0.4rem",
                  color: "#facc15",
                }}
              >
                {claim.issue_type || "Unknown Issue"}
              </h2>

              <p style={{ opacity: 0.85, marginBottom: "0.5rem" }}>
                {claim.summary?.slice(0, 140) || "No summary"}...
              </p>

              <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                {new Date(claim.created_at).toLocaleString()}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
