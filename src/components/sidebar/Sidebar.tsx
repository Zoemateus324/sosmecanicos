
import { Button } from "components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "components/ui/sheet"
import Link from "next/link"
import { PanelBottom } from "lucide-react"

export function Sidebar() {
    return (
        <div className="flex w-full flex-col bg-muted/40">
            
            
            
            <div className="sm:hidden flex flex-col sm-gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center px-4 border-b bg-background gap-4 sm:static
                sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Sheet>
                        <SheetTrigger className="flex items-center justify-between p-4" asChild>
                            <Button size="icon" variant="outline" className="sm:hidden">
                                <PanelBottom className='w-5 h-5'/>
                                <span className="sr-only">
                                    Abrir/Fechar Menu

                                </span>
                                </Button>
                        </SheetTrigger>
                        
                        
                        <SheetContent className="sm:max-w-x">

                    <nav className="grid gap-6 text-lg font-medium">
                        <Link href="/dashboard">
                        <span>Dashboard</span>
                        </Link>
                    </nav>

                        </SheetContent>



                    </Sheet>
                </header>
            </div>
        </div>
    
    )
}