import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface WeekEntry {
  weekNo: number;
  activity: string;
  activityCompleted: string;
}

interface MonthData {
  month: string;
  weeks: WeekEntry[];
}

const logbookData: MonthData[] = [
  {
    month: "JULY / JANUARY",
    weeks: [
      { weekNo: 1, activity: "", activityCompleted: "" },
      { weekNo: 2, activity: "", activityCompleted: "" },
      { weekNo: 3, activity: "", activityCompleted: "" },
      { weekNo: 4, activity: "Requirement Gathering", activityCompleted: "Problem analysis, dataset identification, phishing taxonomy study, system specification" },
      { weekNo: 5, activity: "System Design", activityCompleted: "Architecture design, preprocessing flow, NLP–metadata hybrid design, UML diagram." },
    ],
  },
  {
    month: "AUGUST / FEBRUARY",
    weeks: [
      { weekNo: 1, activity: "3. Preprocessing Pipeline Development", activityCompleted: "Email parser, text extraction, metadata extraction, PII redaction" },
      { weekNo: 2, activity: "4. NLP Model Development", activityCompleted: "DistilBERT integration, tokenization, embedding generation, risk scoring" },
      { weekNo: 3, activity: "5. Metadata Model Development", activityCompleted: "Feature engineering, XGBoost model, anomaly detection" },
      { weekNo: 4, activity: "6. Hybrid Ensemble Development", activityCompleted: "Weighted scoring, threshold calibration, integration testing" },
      { weekNo: 5, activity: "7. Explainability Module", activityCompleted: "SHAP values, metadata importance, word highlights" },
    ],
  },
  {
    month: "SEPTEMBER / MARCH",
    weeks: [
      { weekNo: 1, activity: "", activityCompleted: "" },
      { weekNo: 2, activity: "", activityCompleted: "" },
      { weekNo: 3, activity: "", activityCompleted: "" },
      { weekNo: 4, activity: "", activityCompleted: "" },
      { weekNo: 5, activity: "", activityCompleted: "" },
    ],
  },
  {
    month: "OCTOBER / APRIL",
    weeks: [
      { weekNo: 1, activity: "", activityCompleted: "" },
      { weekNo: 2, activity: "", activityCompleted: "" },
      { weekNo: 3, activity: "", activityCompleted: "" },
      { weekNo: 4, activity: "", activityCompleted: "" },
      { weekNo: 5, activity: "", activityCompleted: "" },
    ],
  },
  {
    month: "NOVEMBER / MAY",
    weeks: [
      { weekNo: 1, activity: "", activityCompleted: "" },
      { weekNo: 2, activity: "", activityCompleted: "" },
      { weekNo: 3, activity: "", activityCompleted: "" },
      { weekNo: 4, activity: "", activityCompleted: "" },
      { weekNo: 5, activity: "", activityCompleted: "" },
    ],
  },
  {
    month: "DECEMBER / JUNE",
    weeks: [
      { weekNo: 1, activity: "", activityCompleted: "" },
      { weekNo: 2, activity: "", activityCompleted: "" },
      { weekNo: 3, activity: "", activityCompleted: "" },
      { weekNo: 4, activity: "", activityCompleted: "" },
      { weekNo: 5, activity: "", activityCompleted: "" },
    ],
  },
];

const Logbook = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Project Logbook</h1>
        <h2 className="text-xl text-muted-foreground mb-8 text-center">SafeCheck - BEC & Phishing Detection System</h2>
        
        <div className="space-y-12">
          {logbookData.map((monthData, index) => (
            <div key={index} className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="bg-muted px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Month: {monthData.month}</h3>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-20 text-center font-semibold">Week No.</TableHead>
                    <TableHead className="w-48 font-semibold">Activity</TableHead>
                    <TableHead className="font-semibold">Activity Completed</TableHead>
                    <TableHead className="w-32 text-center font-semibold">Students Sign</TableHead>
                    <TableHead className="w-40 text-center font-semibold">Internal/External Guide Sign</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthData.weeks.map((week) => (
                    <TableRow key={week.weekNo} className="border-b border-border">
                      <TableCell className="text-center font-medium">{week.weekNo}</TableCell>
                      <TableCell className="font-medium text-foreground">{week.activity || ""}</TableCell>
                      <TableCell className="text-muted-foreground">{week.activityCompleted || ""}</TableCell>
                      <TableCell className="h-16"></TableCell>
                      <TableCell className="h-16"></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="px-6 py-3 bg-muted/30 text-center text-sm text-muted-foreground">
                Weekly Activity Chart
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>20-Week Project Development Timeline</p>
        </div>
      </div>
    </div>
  );
};

export default Logbook;
