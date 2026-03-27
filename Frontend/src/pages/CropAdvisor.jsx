import { useEffect, useMemo, useState } from "react";
import { Brain, Bug, Camera, FlaskConical, Leaf, Loader2, ShieldCheck, Sparkles, Sprout, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

const tabs = [
  { id: "advisor", label: "Crop Planner", icon: Brain, desc: "Full farm planning with stage, goal, budget, and urgency." },
  { id: "disease", label: "Crop Triage", icon: Bug, desc: "Symptom-focused issue analysis and treatment suggestions." },
  { id: "image", label: "Plant Scan", icon: Camera, desc: "Image-based diagnosis with in-shop product matching." },
  { id: "dosage", label: "Dosage Planner", icon: Sprout, desc: "Product-specific dosage and application schedule." },
];

const inputClass = "h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 text-sm text-foreground outline-none";
const textAreaClass = "w-full rounded-[1.4rem] border border-primary/10 bg-white px-4 py-4 text-sm text-foreground outline-none";

const initialAdvisor = {
  cropType: "Wheat",
  soilType: "Loam",
  farmSize: "5",
  cropStage: "vegetative",
  goal: "balanced_nutrition",
  budget: "standard",
  urgency: "medium",
  notes: "",
};

const initialDisease = {
  cropType: "Wheat",
  cropStage: "vegetative",
  severity: "moderate",
  affectedArea: "localized",
  symptoms: "",
};

const initialImage = {
  cropType: "Wheat",
  cropStage: "vegetative",
  notes: "",
};

const initialDosage = {
  cropType: "Wheat",
  farmSize: "5",
  cropStage: "vegetative",
  applicationMode: "soil",
  productId: "",
};

const featureLabels = {
  advisor: "Crop Planner",
  disease: "Crop Triage",
  image_diagnosis: "Plant Scan",
  dosage: "Dosage Planner",
};

const DetailList = ({ items, label, Icon }) =>
  items?.length ? (
    <div className="rounded-[1.4rem] border border-primary/10 bg-white/85 p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mt-4 space-y-3">
        {items.map((entry) => (
          <div key={entry} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Icon className="mt-0.5 h-4 w-4 text-primary" />
            <span>{entry}</span>
          </div>
        ))}
      </div>
    </div>
  ) : null;

const ResultPanel = ({ result, working }) => {
  if (working) {
    return (
      <div className="rounded-[1.6rem] border border-primary/10 bg-white/80 p-10 text-center">
        <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Generating feature-specific output...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-[1.6rem] border border-dashed border-primary/15 bg-white/70 p-10 text-center">
        <Brain className="mx-auto mb-4 h-14 w-14 text-primary/30" />
        <h3 className="font-display text-2xl text-foreground">Specific results appear here</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Each feature now uses its own context instead of reusing the same generic top form.
        </p>
      </div>
    );
  }

  if (result.feature === "error") {
    return <div className="rounded-[1.4rem] border border-red-200 bg-red-50 p-6 text-red-700">{result.summary}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.7rem] border border-primary/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(237,245,232,0.96))] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary/75">{result.feature} output</p>
            <h3 className="mt-3 font-display text-3xl text-foreground">{result.summary}</h3>
          </div>
          <div className="rounded-[1.2rem] border border-primary/10 bg-white/80 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Confidence</p>
            <p className="font-display text-3xl text-primary">{result.aiConfidence || "--"}%</p>
          </div>
        </div>
        {result.engine ? (
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-2 text-primary">
              <ShieldCheck className="h-4 w-4" />
              Engine: {result.engine.model}
            </span>
            {result.engine.aiReady ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-gold/12 px-4 py-2">
                <Sparkles className="h-4 w-4 text-gold" />
                Gemini-backed AI flow
              </span>
            ) : null}
            {result.engine.providerStatus === "fallback" ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-800">
                <ShieldCheck className="h-4 w-4" />
                Fallback mode
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {result.probableIssue ? (
        <div className="rounded-[1.4rem] border border-primary/10 bg-white/85 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Probable issue</p>
          <p className="mt-2 font-display text-2xl text-foreground">{result.probableIssue}</p>
        </div>
      ) : null}

      {result.recommendedProducts?.length ? (
        <div className="grid gap-4">
          {result.recommendedProducts.map((item, index) => {
            const stock = item.availability?.stockQuantity ?? item.product?.stockQuantity ?? 0;
            const unit = item.availability?.unit || item.product?.unit || "";
            const price = item.availability?.price ?? item.product?.price ?? 0;

            return (
              <div key={`${item.product?._id || index}-${index}`} className="rounded-[1.5rem] border border-primary/10 bg-white/90 p-5 shadow-soft">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-foreground">{item.product?.name || "Recommended product"}</p>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {item.priority || "Medium"} priority
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
                  </div>
                  <div className="rounded-[1.1rem] border border-gold/20 bg-gold/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Suggested dosage</p>
                    <p className="mt-2 font-semibold text-foreground">{item.dosage}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{stock > 0 ? `In stock: ${stock} ${unit}` : "Currently unavailable"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Price: Rs.{Number(price).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {result.feature === "dosage" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Per application", result.perApplication],
            ["Total dosage", result.totalDosage],
            ["Frequency", result.frequency],
            ["Duration", result.duration],
            ["Applications", result.applications],
            ["Estimated cost", `Rs.${Number(result.cost || 0).toFixed(2)}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1.4rem] border border-primary/10 bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
              <p className="mt-2 font-display text-2xl text-foreground">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <DetailList items={result.operationalNotes} label="Operational Notes" Icon={Leaf} />
      <DetailList items={result.triage} label="Triage" Icon={Leaf} />
      <DetailList items={result.assumptions} label="Assumptions" Icon={FlaskConical} />
      <DetailList items={result.warnings} label="Warnings" Icon={ShieldCheck} />
    </div>
  );
};

const CropAdvisor = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("advisor");
  const [products, setProducts] = useState([]);
  const [productsError, setProductsError] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [working, setWorking] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [advisorForm, setAdvisorForm] = useState(initialAdvisor);
  const [diseaseForm, setDiseaseForm] = useState(initialDisease);
  const [imageForm, setImageForm] = useState(initialImage);
  const [dosageForm, setDosageForm] = useState(initialDosage);
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await apiClient.get("/products?limit=50");
        const items = response.data?.data || [];
        setProducts(items);
        setDosageForm((prev) => ({ ...prev, productId: prev.productId || items[0]?._id || "" }));
      } catch (error) {
        console.error("Failed to load products for advisor:", error);
        setProductsError("Unable to load products for advisor features.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) {
        setHistory([]);
        return;
      }
      try {
        const response = await apiClient.get("/recommendations/user");
        setHistory(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load recommendation history:", error);
      }
    };

    fetchHistory();
  }, [isAuthenticated, result?._id]);

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === dosageForm.productId),
    [products, dosageForm.productId]
  );

  const updateForm = (setter) => (field, value) => setter((prev) => ({ ...prev, [field]: value }));

  const submit = async (url, payload) => {
      try {
        setWorking(true);
        const response = await apiClient.post(url, payload);
        setResult(response.data?.data || null);
      } catch (error) {
      setResult({
        feature: "error",
        summary: error.data?.message || error.message || "Unable to process request.",
      });
    } finally {
      setWorking(false);
    }
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageDataUrl("");
      setImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      setImageDataUrl(value);
      setImagePreview(value);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f8f0da_0%,#edf5e8_44%,#f6f4ef_100%)]">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <section className="section-shell mx-auto max-w-6xl overflow-hidden px-6 py-8 md:px-8 md:py-10">
            <div className="organic-orb -left-10 top-6 h-36 w-36 bg-gold/20" />
            <div className="organic-orb right-0 top-0 h-44 w-44 bg-leaf/20" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_320px]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  AI advisor engine
                </div>
                <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  Each AI tool now asks for its own context.
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                  Crop planning keeps full farm context. Disease triage focuses on symptoms.
                  Plant scan focuses on the image. Dosage focuses on product and application.
                </p>
              </div>
              <div className="surface-panel p-6">
                <div className="space-y-4">
                  {[
                    "Planner: crop, soil, size, stage, goal, budget, urgency.",
                    "Triage: crop, stage, severity, affected area, symptoms.",
                    "Plant scan: crop, stage, image, notes.",
                    "Dosage: product, crop, farm size, stage, application mode.",
                  ].map((item) => (
                    <div key={item} className="rounded-[1.3rem] border border-primary/10 bg-white/80 p-4 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mx-auto mt-8 grid max-w-6xl gap-8 xl:grid-cols-[minmax(0,1.15fr)_340px]">
            <div className="space-y-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setResult(null);
                    }}
                    className={`rounded-[1.6rem] border p-5 text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? "border-primary bg-white shadow-strong"
                        : "border-white/50 bg-white/75 hover:border-primary/20"
                    }`}
                  >
                    <tab.icon className={`mb-3 h-7 w-7 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="font-display text-xl text-foreground">{tab.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{tab.desc}</p>
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-strong">
                <div className="border-b border-primary/10 bg-[linear-gradient(135deg,rgba(89,126,82,0.08),rgba(255,255,255,0.85))] p-6">
                  {activeTab === "advisor" ? (
                    <div className="space-y-4">
                      <h2 className="font-display text-2xl">Crop planner input</h2>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Crop Type</label><select value={advisorForm.cropType} onChange={(e) => updateForm(setAdvisorForm)("cropType", e.target.value)} className={inputClass}>{["Rice","Wheat","Corn","Vegetables","Fruits"].map((crop) => <option key={crop} value={crop}>{crop}</option>)}</select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Soil Type</label><select value={advisorForm.soilType} onChange={(e) => updateForm(setAdvisorForm)("soilType", e.target.value)} className={inputClass}>{["Clay","Sand","Loam","Silt"].map((soil) => <option key={soil} value={soil}>{soil}</option>)}</select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Farm Size</label><input type="number" min="1" value={advisorForm.farmSize} onChange={(e) => updateForm(setAdvisorForm)("farmSize", e.target.value)} className={inputClass} /></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Crop Stage</label><select value={advisorForm.cropStage} onChange={(e) => updateForm(setAdvisorForm)("cropStage", e.target.value)} className={inputClass}>{["pre_sowing","vegetative","flowering","fruiting","recovery"].map((stage) => <option key={stage} value={stage}>{stage.replaceAll("_"," ")}</option>)}</select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Goal</label><select value={advisorForm.goal} onChange={(e) => updateForm(setAdvisorForm)("goal", e.target.value)} className={inputClass}><option value="balanced_nutrition">Balanced nutrition</option><option value="yield">Yield push</option><option value="root_strength">Root strength</option><option value="flowering">Flowering support</option><option value="recovery">Stress recovery</option></select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Budget</label><select value={advisorForm.budget} onChange={(e) => updateForm(setAdvisorForm)("budget", e.target.value)} className={inputClass}><option value="economical">Economical</option><option value="standard">Standard</option><option value="premium">Premium</option></select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Urgency</label><select value={advisorForm.urgency} onChange={(e) => updateForm(setAdvisorForm)("urgency", e.target.value)} className={inputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
                        <div className="xl:col-span-4"><label className="mb-2 block text-sm font-medium text-foreground">Field notes</label><textarea value={advisorForm.notes} onChange={(e) => updateForm(setAdvisorForm)("notes", e.target.value)} rows={4} className={textAreaClass} placeholder="Optional notes like uneven growth, irrigation issues, or yield concerns." /></div>
                      </div>
                      <Button className="h-12 rounded-full px-6" onClick={() => submit("/recommendations/advisor", { ...advisorForm, farmSize: Number(advisorForm.farmSize) })} disabled={working || Boolean(productsError)}><Target className="mr-2 h-4 w-4" />Generate Crop Plan</Button>
                    </div>
                  ) : null}

                  {activeTab === "disease" ? (
                    <div className="space-y-4">
                      <h2 className="font-display text-2xl">Crop triage input</h2>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Crop Type</label><select value={diseaseForm.cropType} onChange={(e) => updateForm(setDiseaseForm)("cropType", e.target.value)} className={inputClass}>{["Rice","Wheat","Corn","Vegetables","Fruits"].map((crop) => <option key={crop} value={crop}>{crop}</option>)}</select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Crop Stage</label><select value={diseaseForm.cropStage} onChange={(e) => updateForm(setDiseaseForm)("cropStage", e.target.value)} className={inputClass}>{["vegetative","flowering","fruiting","recovery"].map((stage) => <option key={stage} value={stage}>{stage.replaceAll("_"," ")}</option>)}</select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Severity</label><select value={diseaseForm.severity} onChange={(e) => updateForm(setDiseaseForm)("severity", e.target.value)} className={inputClass}><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option></select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Affected Area</label><select value={diseaseForm.affectedArea} onChange={(e) => updateForm(setDiseaseForm)("affectedArea", e.target.value)} className={inputClass}><option value="localized">Localized</option><option value="spreading">Spreading</option><option value="widespread">Widespread</option></select></div>
                        <div className="xl:col-span-4"><label className="mb-2 block text-sm font-medium text-foreground">Symptoms</label><textarea value={diseaseForm.symptoms} onChange={(e) => updateForm(setDiseaseForm)("symptoms", e.target.value)} rows={4} className={textAreaClass} placeholder="Describe what you see on the plant, where it appears, and how quickly it is spreading." /></div>
                      </div>
                      <Button className="h-12 rounded-full px-6" onClick={() => submit("/recommendations/disease", diseaseForm)} disabled={working || Boolean(productsError)}><Bug className="mr-2 h-4 w-4" />Analyze Crop Issue</Button>
                    </div>
                  ) : null}

                  {activeTab === "image" ? (
                    <div className="space-y-4">
                      <h2 className="font-display text-2xl">Plant image diagnosis</h2>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Crop Type</label><select value={imageForm.cropType} onChange={(e) => updateForm(setImageForm)("cropType", e.target.value)} className={inputClass}>{["Rice","Wheat","Corn","Vegetables","Fruits"].map((crop) => <option key={crop} value={crop}>{crop}</option>)}</select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Crop Stage</label><select value={imageForm.cropStage} onChange={(e) => updateForm(setImageForm)("cropStage", e.target.value)} className={inputClass}>{["vegetative","flowering","fruiting","recovery"].map((stage) => <option key={stage} value={stage}>{stage.replaceAll("_"," ")}</option>)}</select></div>
                        <div className="md:col-span-2 xl:col-span-2"><label className="mb-2 block text-sm font-medium text-foreground">Plant image</label><input type="file" accept="image/*" onChange={handleImageFileChange} className="block h-12 w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm text-foreground" /></div>
                        <div className="md:col-span-2 xl:col-span-2"><label className="mb-2 block text-sm font-medium text-foreground">Observation notes</label><textarea value={imageForm.notes} onChange={(e) => updateForm(setImageForm)("notes", e.target.value)} rows={4} className={textAreaClass} placeholder="Optional notes like lower-leaf damage, recent rain, or visible spread pattern." /></div>
                        <div className="md:col-span-2 xl:col-span-2"><label className="mb-2 block text-sm font-medium text-foreground">Preview</label><div className="flex min-h-[190px] items-center justify-center rounded-[1.4rem] border border-dashed border-primary/15 bg-white/70 p-4">{imagePreview ? <img src={imagePreview} alt="Plant preview" className="max-h-[220px] rounded-[1rem] object-cover" /> : <p className="text-sm text-muted-foreground">Upload a plant image for AI-based diagnosis.</p>}</div></div>
                      </div>
                      <Button className="h-12 rounded-full px-6" onClick={() => submit("/recommendations/image-diagnose", { ...imageForm, imageDataUrl })} disabled={working || !imageDataUrl || Boolean(productsError)}><Camera className="mr-2 h-4 w-4" />Analyze Plant Image</Button>
                    </div>
                  ) : null}

                  {activeTab === "dosage" ? (
                    <div className="space-y-4">
                      <h2 className="font-display text-2xl">Dosage planner input</h2>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-foreground">Product</label><select value={dosageForm.productId} onChange={(e) => updateForm(setDosageForm)("productId", e.target.value)} disabled={loadingProducts || products.length === 0} className={inputClass}>{products.map((product) => <option key={product._id} value={product._id}>{product.name} ({product.category})</option>)}</select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Crop Type</label><select value={dosageForm.cropType} onChange={(e) => updateForm(setDosageForm)("cropType", e.target.value)} className={inputClass}>{["Rice","Wheat","Corn","Vegetables","Fruits"].map((crop) => <option key={crop} value={crop}>{crop}</option>)}</select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Farm Size</label><input type="number" min="1" value={dosageForm.farmSize} onChange={(e) => updateForm(setDosageForm)("farmSize", e.target.value)} className={inputClass} /></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Crop Stage</label><select value={dosageForm.cropStage} onChange={(e) => updateForm(setDosageForm)("cropStage", e.target.value)} className={inputClass}>{["pre_sowing","vegetative","flowering","fruiting","recovery"].map((stage) => <option key={stage} value={stage}>{stage.replaceAll("_"," ")}</option>)}</select></div>
                        <div><label className="mb-2 block text-sm font-medium text-foreground">Application Mode</label><select value={dosageForm.applicationMode} onChange={(e) => updateForm(setDosageForm)("applicationMode", e.target.value)} className={inputClass}><option value="soil">Soil application</option><option value="foliar">Foliar spray</option></select></div>
                      </div>
                      <Button className="h-12 rounded-full px-6" onClick={() => submit("/recommendations/dosage/calculate", { ...dosageForm, farmSize: Number(dosageForm.farmSize) })} disabled={working || loadingProducts || Boolean(productsError)}><Sprout className="mr-2 h-4 w-4" />Calculate Dosage</Button>
                    </div>
                  ) : null}
                </div>

                <div className="p-6">
                  <ResultPanel result={result} working={working} />
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="surface-panel p-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Live catalog context</p>
                    <p className="text-sm text-muted-foreground">
                      {loadingProducts ? "Loading product inventory..." : `${products.length} products available for matching.`}
                    </p>
                  </div>
                </div>

                {activeTab === "dosage" && selectedProduct ? (
                  <div className="mt-5 rounded-[1.3rem] border border-primary/10 bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Selected product</p>
                    <p className="mt-2 font-semibold text-foreground">{selectedProduct.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedProduct.category} | Rs.{Number(selectedProduct.price).toFixed(2)}
                    </p>
                  </div>
                ) : null}

                {activeTab === "image" ? (
                  <div className="mt-5 rounded-[1.3rem] border border-primary/10 bg-white/80 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Plant scan flow</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The image is analyzed first, then the backend matches the diagnosis to real in-stock products from your shop.
                    </p>
                  </div>
                ) : null}

                {productsError ? (
                  <div className="mt-5 rounded-[1.3rem] border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {productsError}
                  </div>
                ) : null}
              </div>

              <div className="surface-panel p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-primary/75">Recommendation history</p>
                <h3 className="mt-2 font-display text-2xl text-foreground">
                  {isAuthenticated ? "Saved sessions" : "Sign in to save history"}
                </h3>
                <div className="mt-5 space-y-4">
                  {history.length === 0 ? (
                    <div className="rounded-[1.3rem] border border-dashed border-primary/15 bg-white/75 p-4 text-sm text-muted-foreground">
                      {isAuthenticated ? "Your advisor runs will appear here." : "Recommendation history is available after login."}
                    </div>
                  ) : (
                    history.slice(0, 4).map((item) => (
                      <div key={item._id} className="rounded-[1.3rem] border border-primary/10 bg-white/80 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-foreground">{featureLabels[item.featureType] || item.cropType}</p>
                          <span className="text-xs text-muted-foreground">{item.aiConfidence || 0}%</span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{item.summary || item.cropType}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                            {item.cropType}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-muted-foreground">
                            {item.aiProvider || "rules-engine"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-muted-foreground">
                            {item.providerStatus === "fallback" ? "Fallback" : "Primary"}
                          </span>
                        </div>
                        {item.soilType && item.soilType !== "N/A" ? (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {item.soilType} soil | {item.farmSize} acres
                          </p>
                        ) : null}
                        {item.diseaseDetected ? (
                          <p className="mt-2 text-sm text-foreground">Issue: {item.diseaseDetected}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CropAdvisor;
