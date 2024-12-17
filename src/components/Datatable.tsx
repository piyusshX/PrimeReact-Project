import { useState, useEffect, useRef  } from "react";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { useForm, SubmitHandler } from "react-hook-form"

interface ArtistInfo {
    id: number;
    title: string;           
    place_of_origin: string | null; 
    artist_display: string;  
    inscriptions: string | null;    
    date_start: number;      
    date_end: number;
}

interface FormInputs {
    checkboxInput: string;
}

interface ApiResponse {
    data: ArtistInfo[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        total_pages: number;
        current_page: number;
        next_url: string;
    };
    info?: any;       
    config?: any;     
}

function Datatable() {
    const op = useRef<OverlayPanel>(null);
    const { register, handleSubmit } = useForm<FormInputs>();
    const [userData, setUserData] = useState<ArtistInfo[]>([]);
    const [selectedArtists, setSelectedArtists] = useState<ArtistInfo[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [checkboxes, setCheckboxes] = useState<number | null>(null)

    const handlePrev = () => {
        if (page !== 1) setPage(page => page - 1)
    }

    const handleNext = () => {
        setPage(page => page + 1)
    }

    const fetchUsers = async () => {
        setLoading(true); 
        try {
            const res = await fetch(
                `https://api.artic.edu/api/v1/artworks?page=${page}`
            );
            const data: ApiResponse = await res.json();
            const artists: ArtistInfo[] = data.data.map((artist) => ({ // Use map directly
                id: artist.id,
                title: artist.title,
                place_of_origin: artist.place_of_origin || "Place of origin is not available",
                artist_display: artist.artist_display,
                inscriptions: artist.inscriptions || "Inscription is not available",
                date_start: artist.date_start,
                date_end: artist.date_end,
            }));
            setUserData(artists);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false); 
        }
    };

    useEffect(() => {
      fetchUsers()
    }, [page])

    const onSubmit: SubmitHandler<FormInputs> = (data) => {
        setCheckboxes(parseInt(data.checkboxInput))
    };
    
    const actionButtonTemplate = () => {
        return (
            <div>
                <Button
                    type="button"
                    label="Open Panel"
                    icon="pi pi-chevron-down"
                    onClick={(e) => op.current?.toggle(e)}
                />
                <OverlayPanel ref={op}>
                    <div>
                        <form onSubmit={handleSubmit(onSubmit)} className="flex items-center">
                            <input 
                                className="px-4 py-2 w-60 border rounded"
                                type="number" 
                                {...register("checkboxInput", { required: "Username is required" })}
                            />
                            <Button icon="pi pi-check" className=" ml-3" type="submit">Apply</Button>
                        </form>
                    </div>
                </OverlayPanel>
            </div>
        )
    }
    return (
        <div className="card">
            <DataTable
                tableStyle={{ minWidth: '50rem' }}
                value={userData}
                dataKey="id"
                loading={loading} 
                emptyMessage="No data found"
                rows={12}
                showGridlines
                selectionMode={'multiple'} 
                selection={selectedArtists!}
                onSelectionChange={(e) => setSelectedArtists(e.value)}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column 
                    header={actionButtonTemplate} 
                    style={{ width: '150px' }} 
                />
                <Column field="title" header="Title"></Column>
                <Column field="place_of_origin" header="Place of Origin"></Column>
                <Column field="artist_display" header="Artist Display"></Column>
                <Column field="inscriptions" header="Inscriptions"></Column>
                <Column field="date_start" header="Date Start"></Column>
                <Column field="date_end" header="Date End"></Column>
            </DataTable>
            <div className="flex gap-4 justify-center my-4">
                <button className="px-3 py-2 bg-blue-400 rounded-md" onClick={handlePrev}>Perv</button>
                <button className="px-3 py-2 bg-blue-400 rounded-md" onClick={handleNext}>Next</button>
            </div>
        </div>
    );
}

export default Datatable;
