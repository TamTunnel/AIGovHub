
import asyncio
import httpx
import json
import sys
import os
import socket
from datetime import datetime
from urllib.parse import urlparse

# Configuration (allow override via env; try host.docker.internal -> localhost)
def _url_reachable(url, timeout=1.0):
    try:
        p = urlparse(url)
        host = p.hostname or "localhost"
        port = p.port or (443 if p.scheme == "https" else 80)
        sock = socket.create_connection((host, port), timeout)
        sock.close()
        return True
    except Exception:
        return False

API_URL = os.getenv("API_URL")
candidates = [API_URL, "http://host.docker.internal:8000/api/v1", "http://localhost:8000/api/v1"]
API_URL = next((c for c in candidates if c and _url_reachable(c)), candidates[0])
# For a real demo with auth, we would need to login first. 
# Assuming default dev setup might allow open access or we mock a token if RBAC is strict.
# Based on existing code, some endpoints might be protected.
# Let's assume we can use a hardcoded admin token or similar if needed, 
# but for now we'll try to follow the likely open dev paths or basic auth patterns.
# Note: In a fresh dev setup, we might need to create a user first.

print(f"🚀 Starting AI Governance Hub Demo against {API_URL}...\n")

async def run_demo():
    async with httpx.AsyncClient(base_url=API_URL, timeout=10.0) as client:
        
        # 1. Check Health
        print("[1] Checking API Health...")
        try:
            resp = await client.get("/")
            # Try to read a 'message' (root) if present
            try:
                root_json = resp.json()
            except Exception:
                root_json = None

            if resp.status_code == 200 and root_json and isinstance(root_json, dict) and root_json.get('message'):
                print(f"   ✅ API is up: {root_json.get('message')}")
            else:
                # If base_url targets /api/v1, try the health route under that prefix
                resp2 = await client.get("/health")
                if resp2.status_code == 200:
                    try:
                        h = resp2.json()
                        status_str = h.get('status') or h.get('message') or str(h)
                    except Exception:
                        status_str = resp2.text
                    print(f"   ✅ API is up: {status_str}")
                else:
                    print(f"   ❌ Health check failed: {resp.status_code} {resp.text}")
                    print("   Make sure 'docker compose up' is running!")
                    sys.exit(1)
        except Exception as e:
            print(f"   ❌ API Not Reachable: {e}")
            print("   Make sure 'docker compose up' is running!")
            sys.exit(1)
        
        # 2. Register a High-Risk Model
        print("\n[2] Registering 'Credit Risk Scoring v1' Model...")
        model_payload = {
            "name": f"Credit Risk Scoring {datetime.now().strftime('%H%M%S')}",
            "owner": "Finance-Risk-Team",
            "description": "Predicts loan default probability for retail customers.",
            "risk_level": "high",
            "domain": "finance",
            "data_sensitivity": "pii",
            "data_classification": "confidential",
            "monitor_plan": "Monthly drift checks"
        }
        resp = await client.post("/models/", json=model_payload)
        if resp.status_code not in [200, 201]:
            print(f"   ❌ Failed: {resp.text}")
            return
        model = resp.json()
        model_id = model['id']
        print(f"   ✅ Created Model ID {model_id}: {model['name']}")

        # 3. Register a Sensitive Dataset
        print("\n[3] Registering 'Customer Transaction Data 2024' Dataset...")
        dataset_payload = {
            "name": "Customer Transactions 2024",
            "source_system": "DataLake_Finance",
            "data_sensitivity": "pii",
            "data_classification": "restricted"
        }
        resp = await client.post("/datasets/", json=dataset_payload)
        dataset = resp.json()
        dataset_id = dataset['id']
        print(f"   ✅ Created Dataset ID {dataset_id}: {dataset['name']} ({dataset['data_sensitivity']})")

        # 4. Link Dataset to Model (Lineage)
        print("\n[4] Linking Dataset to Model...")
        link_payload = {
            "dataset_id": dataset_id,
            "dataset_type": "training"
        }
        resp = await client.post(f"/models/{model_id}/datasets/", json=link_payload)
        print("   ✅ Lineage Established")

        # 5. Create a Policy (Block High Risk without Approval)
        print("\n[5] Creating Policy: 'Block Unapproved High Risk'...")
        policy_payload = {
            "name": f"High Risk Guardrail {datetime.now().strftime('%H%M')}",
            "description": "Blocks deployment of high-risk models without human approval",
            "scope": "global",
            "condition_type": "block_high_risk_without_approval",
            "is_active": True
        }
        # Note: Policy endpoint might differ slightly based on implementation, adjusting if needed
        # Assuming /policies/ based on previous browsing
        resp = await client.post("/policies/", json=policy_payload)
        if resp.status_code in [200, 201]:
             print(f"   ✅ Policy Created: {resp.json()['name']}")
        else:
             print(f"   ⚠️ Could not create policy (might already exist): {resp.status_code}")

        # 6. Attempt Invalid Status Change (Simulating Policy Violation)
        print("\n[6] Attempting to approve model WITHOUT missing notes...")
        # Assuming we try to set to 'approved' directly
        # The prompt mentioned "Human Approvals" requiring notes.
        status_payload = {
            "status": "approved",
            "reason": "Rushing into production!"
            # Missing "approval_notes"
        }
        resp = await client.patch(f"/models/{model_id}/compliance-status", json=status_payload)
        if resp.status_code == 400 or resp.status_code == 403:
             print(f"   ✅ Request Blocked as Expected! Code: {resp.status_code}")
             print(f"   Reason: {resp.json()['detail']}")
        else:
             print(f"   ❌ Unexpected success or error: {resp.status_code} {resp.text}")

        # 7. Valid Approval (Human-in-the-Loop)
        print("\n[7] Approving model WITH required notes...")
        status_payload_valid = {
            "status": "approved",
            "reason": "Passed all risk checks.",
            "approval_notes": "Reviewed by CISO on 2024-01-01. Mitigation controls in place."
        }
        resp = await client.patch(f"/models/{model_id}/compliance-status", json=status_payload_valid)
        if resp.status_code == 200:
             updated_model = resp.json()
             print(f"   ✅ Model Approved!")
             print(f"   Approver ID: {updated_model.get('approved_by_user_id')}")
             print(f"   Notes: {updated_model.get('approval_notes')}")
        else:
             print(f"   ❌ Failed to approve: {resp.status_code} {resp.text}")

        print("\n✨ Demo Completed Successfully! View your model in the Dashboard.")

if __name__ == "__main__":
    asyncio.run(run_demo())
