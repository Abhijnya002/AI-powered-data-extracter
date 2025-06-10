
import { useState, useRef } from 'react';
import { Upload, FileText, Download, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setFile(uploadedFile);
      setError(null);
      setProcessedFile(null);
      toast({
        title: "File uploaded successfully",
        description: `${uploadedFile.name} is ready for processing`,
      });
    } else {
      setError('Please upload a valid Word document (.docx)');
      toast({
        title: "Invalid file type",
        description: "Please upload a .docx file",
        variant: "destructive",
      });
    }
  };

  const simulateProcessing = async () => {
    setProcessing(true);
    setProgress(0);
    setError(null);

    // Simulate processing steps with progress updates
    const steps = [
      { progress: 20, message: "Loading document..." },
      { progress: 40, message: "Extracting task sentences..." },
      { progress: 60, message: "Processing with AI..." },
      { progress: 80, message: "Generating Excel structure..." },
      { progress: 100, message: "Finalizing document..." }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(step.progress);
      toast({
        title: "Processing",
        description: step.message,
      });
    }

    // Simulate successful processing
    const excelFileName = file?.name?.replace('.docx', '.xlsx') || 'processed_document.xlsx';
    setProcessedFile(excelFileName);
    setProcessing(false);
    
    toast({
      title: "Processing complete!",
      description: "Your Excel document is ready for download",
    });
  };

  const handleDownload = () => {
    if (!processedFile) return;
    
    // In a real implementation, this would download the actual processed file
    // Here we create a simple Excel file with some data to demonstrate functionality
    const blob = generateExcelBlob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = processedFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your processed Excel file is downloading",
    });
  };
  
  // Generate a simple Excel file blob for demonstration
  const generateExcelBlob = () => {
    // Create a very simple Excel XML file
    const excelXml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="ProgId" content="Excel.Sheet">
      </head>
      <body>
        <table>
          <tr>
            <th>Category</th>
            <th>Task Description</th>
            <th>Budget</th>
            <th>Proposed</th>
            <th>Comment</th>
            <th>Drawing Ref</th>
            <th>Lead</th>
          </tr>
          <tr>
            <td>Kitchen</td>
            <td>Install New Cabinets</td>
            <td>5000</td>
            <td>Complete kitchen cabinet replacement</td>
            <td>Custom cabinets with soft-close hinges</td>
            <td>Design sketch</td>
            <td>Contractor</td>
          </tr>
          <tr>
            <td>Bathroom</td>
            <td>Tile Flooring</td>
            <td>2500</td>
            <td>Install ceramic floor tiles</td>
            <td>Waterproof installation with underfloor heating</td>
            <td>Renovation plan</td>
            <td>Al</td>
          </tr>
        </table>
      </body>
      </html>
    `;
    
    // Convert to Blob
    const blob = new Blob([excelXml], {type: 'application/vnd.ms-excel'});
    return blob;
  };

  const resetUpload = () => {
    setFile(null);
    setProcessedFile(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Background Elements - Professional but modern */}
      <div className="fixed top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl animate-pulse-soft"></div>
      <div className="fixed bottom-1/4 right-10 w-80 h-80 bg-blue-100/20 rounded-full filter blur-3xl animate-pulse-soft" style={{animationDelay: '2s'}}></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with enhanced animation */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
              Document Processing Suite
            </span>
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-blue-700/40 rounded-full"></div>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
            Transform your Word documents into structured Excel reports with AI-powered task extraction and categorization
          </p>
        </div>

        {/* Main Processing Card - Enhanced design */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm animate-scale-in hover:shadow-2xl transition-shadow duration-500">
            <CardHeader className="text-center pb-8 border-b border-gray-100">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Document Processor
              </CardTitle>
              <CardDescription className="text-base">
                Upload your Word document to extract tasks, budgets, and generate a professional scope of work
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 pt-8">
              {/* Upload Area - Enhanced interactivity */}
              {!file && (
                <div className="animate-fade-in">
                  <div
                    className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center hover:border-primary/50 transition-all cursor-pointer group bg-blue-50/30"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <Upload className="h-16 w-16 text-primary/60 absolute top-0 left-0 group-hover:opacity-0 transition-all duration-300" />
                      <ArrowDown className="h-16 w-16 text-primary absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Upload Word Document</h3>
                    <p className="text-muted-foreground mb-4">
                      Click to select or drag and drop your .docx file
                    </p>
                    <Button variant="outline" className="hover-scale bg-white">
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* File Selected - Enhanced design */}
              {file && !processing && !processedFile && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between p-6 bg-green-50/80 rounded-lg border border-green-200 hover:bg-green-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-900">{file.name}</h4>
                        <p className="text-sm text-green-700">Ready for processing</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={simulateProcessing} className="hover-scale bg-gradient-to-r from-primary to-blue-700">
                        Process Document
                      </Button>
                      <Button variant="outline" onClick={resetUpload}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Processing State - Enhanced animation */}
              {processing && (
                <div className="animate-fade-in">
                  <div className="p-8 text-center">
                    <div className="relative mx-auto w-24 h-24 mb-4">
                      <Loader2 className="h-12 w-12 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
                      <div 
                        className="absolute top-0 left-0 w-24 h-24 border-4 border-primary rounded-full" 
                        style={{ 
                          clipPath: `polygon(50% 50%, 100% 0%, 100% ${progress}%, 50% 50%)`,
                          transform: `rotate(${progress * 3.6}deg)` 
                        }}
                      ></div>
                    </div>
                    <h3 className="text-lg font-semibold mb-4">Processing Document</h3>
                    <div className="max-w-md mx-auto mb-4">
                      <Progress value={progress} className="h-3" />
                    </div>
                    <p className="text-muted-foreground">
                      Please wait while we extract and organize your document content...
                    </p>
                  </div>
                </div>
              )}

              {/* Processing Complete - Enhanced download UI */}
              {processedFile && !processing && (
                <div className="animate-fade-in">
                  <div className="p-8 text-center bg-blue-50/70 rounded-lg border border-blue-200 hover:bg-blue-50/90 transition-all">
                    <div className="relative mx-auto w-16 h-16 mb-4 group">
                      <FileSpreadsheet className="h-16 w-16 text-blue-600 mx-auto" />
                      <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 shadow-lg transform translate-x-1/4 translate-y-1/4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">
                      Processing Complete!
                    </h3>
                    <p className="text-blue-700 mb-6">
                      Your Excel document has been generated successfully
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button onClick={handleDownload} className="hover-scale bg-gradient-to-r from-green-500 to-emerald-600">
                        <Download className="h-4 w-4 mr-2" />
                        Download Excel
                      </Button>
                      <Button variant="outline" onClick={resetUpload}>
                        Process Another
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State - Enhanced UI */}
              {error && (
                <div className="animate-fade-in">
                  <div className="p-6 bg-red-50/80 rounded-lg border border-red-200 flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-900">Error</h4>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Section - Enhanced design */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center p-6 hover-scale bg-white/50 backdrop-blur-sm border-0 shadow-md overflow-hidden group">
              <div className="relative">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/5 scale-0 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              <h3 className="font-semibold mb-2 relative z-10">Smart Extraction</h3>
              <p className="text-sm text-muted-foreground relative z-10">
                AI-powered task and budget extraction from your documents
              </p>
            </Card>
            
            <Card className="text-center p-6 hover-scale bg-white/50 backdrop-blur-sm border-0 shadow-md overflow-hidden group">
              <div className="relative">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/5 scale-0 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              <h3 className="font-semibold mb-2 relative z-10">Auto Categorization</h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Automatically organize tasks by category and priority
              </p>
            </Card>
            
            <Card className="text-center p-6 hover-scale bg-white/50 backdrop-blur-sm border-0 shadow-md overflow-hidden group">
              <div className="relative">
                <Download className="h-12 w-12 text-primary mx-auto mb-4 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/5 scale-0 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              </div>
              <h3 className="font-semibold mb-2 relative z-10">Excel Export</h3>
              <p className="text-sm text-muted-foreground relative z-10">
                Professional Excel reports with formatting and structure
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
